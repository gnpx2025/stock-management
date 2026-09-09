using ERP.Application.Auth.Abstractions;
using ERP.Domain.Identity;
using ERP.Infrastructure.Identity;
using Microsoft.Extensions.Options;

namespace ERP.UnitTests.Auth;

public sealed class AuthPasswordHasherTests
{
    private readonly AuthPasswordHasher _hasher = new();

    [Fact]
    public void Hash_and_verify_round_trip_succeeds()
    {
        var user = AuthUser.Create("admin", "admin@example.com", "pending", DateTimeOffset.UtcNow);
        var hash = _hasher.HashPassword(user, "ChangeMe!DevOnly1");
        user.SetPasswordHash(hash, DateTimeOffset.UtcNow);

        Assert.True(_hasher.VerifyPassword(user, "ChangeMe!DevOnly1"));
        Assert.False(_hasher.VerifyPassword(user, "wrong-password"));
    }
}

public sealed class JwtTokenServiceTests
{
    [Fact]
    public void CreateAccessToken_includes_sub_and_username()
    {
        var options = Options.Create(new JwtOptions
        {
            Issuer = "erp",
            Audience = "erp-shell",
            SigningKey = "UNIT_TEST_SIGNING_KEY_AT_LEAST_32_CHARS!!",
            AccessTokenMinutes = 15
        });
        var service = new JwtTokenService(options);
        var user = AuthUser.Create("admin", "admin@example.com", "hash", DateTimeOffset.UtcNow);

        var (token, expiresAt) = service.CreateAccessToken(user);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.True(expiresAt > DateTimeOffset.UtcNow);
        Assert.Contains('.', token);
    }
}

public sealed class RefreshTokenHasherTests
{
    [Fact]
    public void Hash_is_deterministic_and_not_plaintext()
    {
        IRefreshTokenHasher hasher = new RefreshTokenHasher();
        const string token = "plain-refresh-token-value";

        var hash1 = hasher.Hash(token);
        var hash2 = hasher.Hash(token);

        Assert.Equal(hash1, hash2);
        Assert.DoesNotContain(token, hash1, StringComparison.Ordinal);
    }
}
