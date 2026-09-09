using ERP.Domain.Common;

namespace ERP.Domain.Identity;

public sealed class RefreshSession : Entity
{
    public Guid UserId { get; private set; }
    public Guid FamilyId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset ExpiresAtUtc { get; private set; }
    public DateTimeOffset? RevokedAtUtc { get; private set; }
    public Guid? ReplacedBySessionId { get; private set; }
    public string? CreatedByIp { get; private set; }
    public string? UserAgent { get; private set; }

    private RefreshSession()
    {
    }

    public bool IsRevoked => RevokedAtUtc is not null;

    public bool IsExpired(DateTimeOffset utcNow) => utcNow >= ExpiresAtUtc;

    public static RefreshSession Create(
        Guid userId,
        Guid familyId,
        string tokenHash,
        DateTimeOffset utcNow,
        DateTimeOffset expiresAtUtc,
        string? createdByIp,
        string? userAgent)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);

        return new RefreshSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            FamilyId = familyId,
            TokenHash = tokenHash,
            CreatedAtUtc = utcNow,
            ExpiresAtUtc = expiresAtUtc,
            CreatedByIp = Truncate(createdByIp, 64),
            UserAgent = Truncate(userAgent, 256)
        };
    }

    public void Revoke(DateTimeOffset utcNow, Guid? replacedBySessionId = null)
    {
        if (IsRevoked)
        {
            return;
        }

        RevokedAtUtc = utcNow;
        ReplacedBySessionId = replacedBySessionId;
    }

    private static string? Truncate(string? value, int max)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Length <= max ? value : value[..max];
    }
}
