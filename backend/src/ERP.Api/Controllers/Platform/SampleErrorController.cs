using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace ERP.Api.Controllers.Platform;

/// <summary>
/// Development/Testing-only endpoint to exercise Problem Details responses.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/platform/errors")]
public sealed class SampleErrorController(IHostEnvironment environment) : ControllerBase
{
    [HttpGet("sample")]
    [Produces("application/problem+json")]
    public IActionResult Sample()
    {
        if (!environment.IsDevelopment() && !environment.IsEnvironment("Testing"))
        {
            return NotFound();
        }

        throw new InvalidOperationException("Sample error for Problem Details testing.");
    }
}
