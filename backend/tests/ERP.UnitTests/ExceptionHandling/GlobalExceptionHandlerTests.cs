using ERP.Api.Infrastructure.ExceptionHandling;
using ERP.Api.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using System.Text.Json;

namespace ERP.UnitTests.ExceptionHandling;

public sealed class GlobalExceptionHandlerTests
{
    [Fact]
    public async Task TryHandleAsync_WritesProblemDetails_WithCorrelationId()
    {
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/platform/errors/sample";
        context.Items[CorrelationIdMiddleware.ItemKey] = "test-correlation-123";
        context.Response.Body = new MemoryStream();

        var handled = await handler.TryHandleAsync(
            context,
            new InvalidOperationException("boom"),
            CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
        Assert.StartsWith("application/problem+json", context.Response.ContentType);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var document = await JsonDocument.ParseAsync(context.Response.Body);
        var root = document.RootElement;

        Assert.Equal(500, root.GetProperty("status").GetInt32());
        Assert.Equal("test-correlation-123", root.GetProperty("correlationId").GetString());
        Assert.Equal("/api/v1/platform/errors/sample", root.GetProperty("instance").GetString());
    }

    [Fact]
    public async Task TryHandleAsync_FallsBackToTraceIdentifier_WhenCorrelationMissing()
    {
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        var context = new DefaultHttpContext();
        context.TraceIdentifier = "trace-xyz";
        context.Response.Body = new MemoryStream();

        var handled = await handler.TryHandleAsync(
            context,
            new Exception("fail"),
            CancellationToken.None);

        Assert.True(handled);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var document = await JsonDocument.ParseAsync(context.Response.Body);
        Assert.Equal("trace-xyz", document.RootElement.GetProperty("correlationId").GetString());
    }
}
