using ERP.Infrastructure.Identity;
using Microsoft.AspNetCore.Http;

namespace ERP.Api.Auth;

public sealed class AuthCookieService(IHostEnvironment environment, Microsoft.Extensions.Options.IOptions<RefreshOptions> options)
{
    private readonly RefreshOptions _options = options.Value;

    public void SetSessionCookies(HttpResponse response, string refreshToken, DateTimeOffset refreshExpiresAt)
    {
        response.Cookies.Append(_options.CookieName, refreshToken, BuildRefreshCookie(refreshExpiresAt));
        response.Cookies.Append(_options.IndicatorCookieName, "1", BuildIndicatorCookie(refreshExpiresAt));
    }

    public void ClearSessionCookies(HttpResponse response)
    {
        response.Cookies.Delete(_options.CookieName, BuildRefreshCookie(DateTimeOffset.UtcNow.AddDays(-1)));
        response.Cookies.Delete(_options.IndicatorCookieName, BuildIndicatorCookie(DateTimeOffset.UtcNow.AddDays(-1)));
    }

    public string? ReadRefreshToken(HttpRequest request) =>
        request.Cookies.TryGetValue(_options.CookieName, out var value) ? value : null;

    private CookieOptions BuildRefreshCookie(DateTimeOffset expires) =>
        new()
        {
            HttpOnly = true,
            Secure = IsSecure(),
            SameSite = ParseSameSite(),
            Expires = expires.UtcDateTime,
            Path = "/",
            IsEssential = true
        };

    private CookieOptions BuildIndicatorCookie(DateTimeOffset expires) =>
        new()
        {
            HttpOnly = false,
            Secure = IsSecure(),
            SameSite = ParseSameSite(),
            Expires = expires.UtcDateTime,
            Path = "/",
            IsEssential = true
        };

    private bool IsSecure() =>
        _options.Secure ?? !environment.IsDevelopment() && !environment.IsEnvironment("Testing");

    private SameSiteMode ParseSameSite() =>
        _options.SameSite.Equals("Lax", StringComparison.OrdinalIgnoreCase)
            ? SameSiteMode.Lax
            : _options.SameSite.Equals("Strict", StringComparison.OrdinalIgnoreCase)
                ? SameSiteMode.Strict
                : SameSiteMode.None;
}
