using ERP.Domain.Common;

namespace ERP.Domain.Identity;

public sealed class AuthUser : Entity
{
    public string UserName { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string NormalizedUserName { get; private set; } = string.Empty;
    public string? NormalizedEmail { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    private AuthUser()
    {
    }

    public static AuthUser Create(
        string userName,
        string? email,
        string passwordHash,
        DateTimeOffset utcNow)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userName);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);

        var normalizedUserName = Normalize(userName);
        var normalizedEmail = string.IsNullOrWhiteSpace(email) ? null : Normalize(email);

        return new AuthUser
        {
            Id = Guid.NewGuid(),
            UserName = userName.Trim(),
            Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim(),
            NormalizedUserName = normalizedUserName,
            NormalizedEmail = normalizedEmail,
            PasswordHash = passwordHash,
            IsActive = true,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };
    }

    public void SetPasswordHash(string passwordHash, DateTimeOffset utcNow)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        PasswordHash = passwordHash;
        UpdatedAtUtc = utcNow;
    }

    public void SetActive(bool isActive, DateTimeOffset utcNow)
    {
        IsActive = isActive;
        UpdatedAtUtc = utcNow;
    }

    public static string Normalize(string value) => value.Trim().ToUpperInvariant();
}
