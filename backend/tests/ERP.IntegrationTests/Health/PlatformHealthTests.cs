using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ERP.Application.Health;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ERP.IntegrationTests.Health;

public sealed class PlatformHealthTests : IClassFixture<ErpWebApplicationFactory>
{
    private readonly ErpWebApplicationFactory _factory;

    public PlatformHealthTests(ErpWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task HealthLive_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/health/live");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PlatformHealth_ReturnsPayload_AndCorrelationHeader()
    {
        var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/platform/health");
        request.Headers.Add("X-Correlation-ID", "integration-corr-1");

        var response = await client.SendAsync(request);
        Assert.True(
            response.StatusCode is HttpStatusCode.OK or HttpStatusCode.ServiceUnavailable,
            $"Unexpected status: {(int)response.StatusCode}");

        Assert.True(response.Headers.TryGetValues("X-Correlation-ID", out var values));
        Assert.Equal("integration-corr-1", values.Single());

        var payload = await response.Content.ReadFromJsonAsync<HealthStatusDto>(JsonOptions());
        Assert.NotNull(payload);
        Assert.Equal("api", payload.Api.Name);
        Assert.Equal("database", payload.Database.Name);
        Assert.Equal("integration-corr-1", payload.CorrelationId);

        if (payload.Status == PlatformHealthStatus.Unhealthy)
        {
            Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        }
        else
        {
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task HealthReady_MatchesDatabaseAvailability()
    {
        var client = _factory.CreateClient();
        var ready = await client.GetAsync("/health/ready");
        var platform = await client.GetAsync("/api/v1/platform/health");
        var health = await platform.Content.ReadFromJsonAsync<HealthStatusDto>(JsonOptions());
        Assert.NotNull(health);

        if (health.Database.Status == PlatformHealthStatus.Healthy)
        {
            Assert.Equal(HttpStatusCode.OK, ready.StatusCode);
            Assert.Equal(HttpStatusCode.OK, platform.StatusCode);
        }
        else
        {
            // Graceful when Postgres is not running locally: unhealthy path is still asserted.
            Assert.Equal(HttpStatusCode.ServiceUnavailable, ready.StatusCode);
            Assert.Equal(HttpStatusCode.ServiceUnavailable, platform.StatusCode);
        }
    }

    private static JsonSerializerOptions JsonOptions() => new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };
}
