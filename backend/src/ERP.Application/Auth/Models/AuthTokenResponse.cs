namespace ERP.Application.Auth.Models;

public sealed record AuthenticatedUserDto(Guid Id, string UserName, string? Email);

public sealed record AuthTokenResponse(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    AuthenticatedUserDto User);

public sealed record AuthSessionIssue(
    AuthTokenResponse Response,
    string RefreshToken,
    DateTimeOffset RefreshExpiresAt);
