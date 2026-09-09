using ERP.Application.Auth.Abstractions;
using ERP.Application.Auth.Models;
using ERP.Domain.Identity;
using ERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ERP.Infrastructure.Identity;

public sealed class AuthService(
    ErpDbContext db,
    IAuthPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IRefreshTokenHasher refreshTokenHasher,
    IOptions<RefreshOptions> refreshOptions,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly RefreshOptions _refreshOptions = refreshOptions.Value;

    public async Task<AuthSessionIssue> LoginAsync(
        string usernameOrEmail,
        string password,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        var normalized = AuthUser.Normalize(usernameOrEmail);
        var user = await db.AuthUsers
            .FirstOrDefaultAsync(
                u => u.NormalizedUserName == normalized || u.NormalizedEmail == normalized,
                cancellationToken);

        if (user is null || !passwordHasher.VerifyPassword(user, password))
        {
            logger.LogInformation("Login failed for identifier hash {IdentifierHash}", HashIdentifier(normalized));
            throw new AuthException(AuthFailureReason.InvalidCredentials, "Invalid username or password.");
        }

        if (!user.IsActive)
        {
            logger.LogInformation("Login denied for inactive user {UserId}", user.Id);
            throw new AuthException(AuthFailureReason.InvalidCredentials, "Invalid username or password.");
        }

        var issue = await CreateSessionAsync(user, Guid.NewGuid(), ipAddress, userAgent, cancellationToken);
        logger.LogInformation("Login succeeded for user {UserId}", user.Id);
        return issue;
    }

    public async Task<AuthSessionIssue> RefreshAsync(
        string refreshToken,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        var tokenHash = refreshTokenHasher.Hash(refreshToken);
        var session = await db.RefreshSessions
            .FirstOrDefaultAsync(s => s.TokenHash == tokenHash, cancellationToken);

        if (session is null)
        {
            logger.LogInformation("Refresh failed: unknown token");
            throw new AuthException(AuthFailureReason.InvalidRefresh, "Session expired or invalid.");
        }

        var utcNow = DateTimeOffset.UtcNow;

        if (session.IsRevoked)
        {
            await RevokeFamilyAsync(session.FamilyId, utcNow, cancellationToken);
            logger.LogWarning("Refresh token reuse detected for family {FamilyId}; family revoked", session.FamilyId);
            throw new AuthException(AuthFailureReason.RefreshReuse, "Session expired or invalid.");
        }

        if (session.IsExpired(utcNow))
        {
            session.Revoke(utcNow);
            await db.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Refresh failed: expired session {SessionId}", session.Id);
            throw new AuthException(AuthFailureReason.InvalidRefresh, "Session expired or invalid.");
        }

        var user = await db.AuthUsers.FirstOrDefaultAsync(u => u.Id == session.UserId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            session.Revoke(utcNow);
            await db.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Refresh failed: inactive or missing user {UserId}", session.UserId);
            throw new AuthException(AuthFailureReason.InvalidRefresh, "Session expired or invalid.");
        }

        var refreshTokenValue = RefreshTokenFactory.CreateToken();
        var refreshExpires = utcNow.AddDays(Math.Max(1, _refreshOptions.LifetimeDays));
        var replacement = RefreshSession.Create(
            user.Id,
            session.FamilyId,
            refreshTokenHasher.Hash(refreshTokenValue),
            utcNow,
            refreshExpires,
            ipAddress,
            userAgent);

        db.RefreshSessions.Add(replacement);
        session.Revoke(utcNow, replacement.Id);

        var (accessToken, expiresAt) = jwtTokenService.CreateAccessToken(user);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Refresh succeeded for user {UserId} session family {FamilyId}", user.Id, session.FamilyId);

        return new AuthSessionIssue(
            new AuthTokenResponse(accessToken, expiresAt, ToDto(user)),
            refreshTokenValue,
            refreshExpires);
    }

    public async Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash = refreshTokenHasher.Hash(refreshToken);
        var session = await db.RefreshSessions
            .FirstOrDefaultAsync(s => s.TokenHash == tokenHash, cancellationToken);

        if (session is null || session.IsRevoked)
        {
            return;
        }

        session.Revoke(DateTimeOffset.UtcNow);
        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Logout revoked session {SessionId} for user {UserId}", session.Id, session.UserId);
    }

    public async Task<AuthenticatedUserDto?> GetMeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await db.AuthUsers.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive, cancellationToken);

        return user is null ? null : ToDto(user);
    }

    private async Task<AuthSessionIssue> CreateSessionAsync(
        AuthUser user,
        Guid familyId,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        var utcNow = DateTimeOffset.UtcNow;
        var (accessToken, expiresAt) = jwtTokenService.CreateAccessToken(user);
        var refreshToken = RefreshTokenFactory.CreateToken();
        var refreshExpires = utcNow.AddDays(Math.Max(1, _refreshOptions.LifetimeDays));
        var session = RefreshSession.Create(
            user.Id,
            familyId,
            refreshTokenHasher.Hash(refreshToken),
            utcNow,
            refreshExpires,
            ipAddress,
            userAgent);

        db.RefreshSessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        return new AuthSessionIssue(
            new AuthTokenResponse(accessToken, expiresAt, ToDto(user)),
            refreshToken,
            refreshExpires);
    }

    private async Task RevokeFamilyAsync(Guid familyId, DateTimeOffset utcNow, CancellationToken cancellationToken)
    {
        var sessions = await db.RefreshSessions
            .Where(s => s.FamilyId == familyId && s.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var s in sessions)
        {
            s.Revoke(utcNow);
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static AuthenticatedUserDto ToDto(AuthUser user) =>
        new(user.Id, user.UserName, user.Email);

    private static string HashIdentifier(string normalized)
    {
        var hash = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash)[..12];
    }
}
