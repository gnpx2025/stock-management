using System.Security.Cryptography;
using System.Text;
using ERP.Application.Auth.Abstractions;
using ERP.Domain.Identity;
using Microsoft.AspNetCore.Identity;

namespace ERP.Infrastructure.Identity;

public sealed class AuthPasswordHasher : IAuthPasswordHasher
{
    private readonly PasswordHasher<AuthUser> _hasher = new();

    public string HashPassword(AuthUser user, string password) =>
        _hasher.HashPassword(user, password);

    public bool VerifyPassword(AuthUser user, string password)
    {
        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}

public sealed class RefreshTokenHasher : IRefreshTokenHasher
{
    public string Hash(string refreshToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(bytes);
    }
}

public static class RefreshTokenFactory
{
    public static string CreateToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
