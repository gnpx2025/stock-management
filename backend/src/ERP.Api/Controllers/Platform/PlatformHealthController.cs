using Asp.Versioning;
using ERP.Api.Middleware;
using ERP.Application.Abstractions.Health;
using ERP.Application.Health;
using Microsoft.AspNetCore.Mvc;

namespace ERP.Api.Controllers.Platform;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/platform")]
public sealed class PlatformHealthController(IPlatformHealthService healthService) : ControllerBase
{
    [HttpGet("health")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(HealthStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(HealthStatusDto), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        var correlationId = CorrelationIdMiddleware.GetCorrelationId(HttpContext);
        var health = await healthService.GetPlatformHealthAsync(correlationId, cancellationToken);

        if (health.Status == PlatformHealthStatus.Unhealthy)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, health);
        }

        return Ok(health);
    }
}
