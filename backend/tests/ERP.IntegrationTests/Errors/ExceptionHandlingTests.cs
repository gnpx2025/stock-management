using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ERP.IntegrationTests.Errors;

public sealed class ExceptionHandlingTests : IClassFixture<ErpWebApplicationFactory>
{
    private readonly ErpWebApplicationFactory _factory;

    public ExceptionHandlingTests(ErpWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SampleError_ReturnsProblemDetails_WithCorrelationId()
    {
        var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/platform/errors/sample");
        request.Headers.Add("X-Correlation-ID", "error-corr-42");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType,
            ignoreCase: true);

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        var root = document.RootElement;

        Assert.Equal(500, root.GetProperty("status").GetInt32());
        Assert.Equal("error-corr-42", root.GetProperty("correlationId").GetString());
        Assert.True(response.Headers.TryGetValues("X-Correlation-ID", out var values));
        Assert.Equal("error-corr-42", values.Single());
    }
}
