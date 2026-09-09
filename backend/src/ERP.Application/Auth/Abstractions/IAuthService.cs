using ERP.Application.Auth.Models;
using ERP.Domain.Identity;

namespace ERP.Application.Auth.Abstractions;

public interface IAuthPasswordHasher
{
    string HashPassword(AuthUser user, string password);
    bool VerifyPassword(AuthUser user, string password);
}

public interface IJwtTokenService
{
    (string Token, DateTimeOffset ExpiresAt) CreateAccessToken(AuthUser user);
}

public interface IRefreshTokenHasher
{
    string Hash(string refreshToken);
}

public interface IAuthService
{
    Task<AuthSessionIssue> LoginAsync(
        string usernameOrEmail,
        string password,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task<AuthSessionIssue> RefreshAsync(
        string refreshToken,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default);

    Task<AuthenticatedUserDto?> GetMeAsync(Guid userId, CancellationToken cancellationToken = default);
}
