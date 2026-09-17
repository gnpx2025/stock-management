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
        BuildCookie(expires, httpOnly: true);

    private CookieOptions BuildIndicatorCookie(DateTimeOffset expires) =>
        BuildCookie(expires, httpOnly: false);

    private CookieOptions BuildCookie(DateTimeOffset expires, bool httpOnly)
    {
        var sameSite = ParseSameSite();
        var secure = IsSecure();
        var cookie = new CookieOptions
        {
            HttpOnly = httpOnly,
            Secure = secure,
            SameSite = sameSite,
            Expires = expires.UtcDateTime,
            Path = "/",
            IsEssential = true
        };

        // Cross-site Shell↔API (e.g. separate Render hosts) need CHIPS so browsers
        // still store/send the refresh cookie when third-party cookies are restricted.
        if (sameSite == SameSiteMode.None && secure)
        {
            cookie.Extensions.Add("Partitioned");
        }

        return cookie;
    }

    private bool IsSecure() =>
        _options.Secure ?? !environment.IsDevelopment() && !environment.IsEnvironment("Testing");

    private SameSiteMode ParseSameSite() =>
        _options.SameSite.Equals("Lax", StringComparison.OrdinalIgnoreCase)
            ? SameSiteMode.Lax
            : _options.SameSite.Equals("Strict", StringComparison.OrdinalIgnoreCase)
                ? SameSiteMode.Strict
                : SameSiteMode.None;
}
