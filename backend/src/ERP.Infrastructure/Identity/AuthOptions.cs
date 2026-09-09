namespace ERP.Infrastructure.Identity;

public sealed class JwtOptions
{
    public const string SectionName = "Authentication:Jwt";

    public string Issuer { get; set; } = "erp";
    public string Audience { get; set; } = "erp-shell";
    public string SigningKey { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 15;
}

public sealed class RefreshOptions
{
    public const string SectionName = "Authentication:Refresh";

    public string CookieName { get; set; } = "erp_refresh";
    public string IndicatorCookieName { get; set; } = "erp_auth";
    public int LifetimeDays { get; set; } = 7;
    public string SameSite { get; set; } = "None";
    public bool? Secure { get; set; }
}

public sealed class AuthSeedOptions
{
    public const string SectionName = "Authentication:Seed";

    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
}
