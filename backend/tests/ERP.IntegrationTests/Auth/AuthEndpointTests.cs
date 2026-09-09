using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ERP.Application.Auth.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ERP.IntegrationTests.Auth;

public sealed class AuthEndpointTests : IClassFixture<ErpWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public AuthEndpointTests(ErpWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            HandleCookies = true
        });
    }

    [Fact]
    public async Task Login_with_valid_seed_credentials_returns_token_and_sets_cookie()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            usernameOrEmail = "admin",
            password = "ChangeMe!DevOnly1"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<AuthTokenResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.AccessToken));
        Assert.Equal("admin", body.User.UserName);
        Assert.Contains(response.Headers, h => h.Key == "Set-Cookie");
    }

    [Fact]
    public async Task Login_with_invalid_credentials_returns_generic_401()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            usernameOrEmail = "admin",
            password = "definitely-wrong"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var problem = await response.Content.ReadAsStringAsync();
        Assert.Contains("Invalid username or password", problem, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("inactive", problem, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Me_requires_bearer_token()
    {
        var unauthorized = await _client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, unauthorized.StatusCode);

        var login = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            usernameOrEmail = "admin",
            password = "ChangeMe!DevOnly1"
        });
        var body = await login.Content.ReadFromJsonAsync<AuthTokenResponse>(JsonOptions);
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", body!.AccessToken);
        var me = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
    }

    [Fact]
    public async Task Refresh_rotates_and_logout_revokes_current_session()
    {
        var login = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            usernameOrEmail = "admin",
            password = "ChangeMe!DevOnly1"
        });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var refresh = await _client.PostAsync("/api/v1/auth/refresh", null);
        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);

        var logout = await _client.PostAsync("/api/v1/auth/logout", null);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        var refreshAfterLogout = await _client.PostAsync("/api/v1/auth/refresh", null);
        Assert.Equal(HttpStatusCode.Unauthorized, refreshAfterLogout.StatusCode);
    }
}
