using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Asp.Versioning;
using ERP.Api.Auth;
using ERP.Application.Auth.Abstractions;
using ERP.Application.Auth.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ERP.Api.Controllers.Auth;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public sealed class AuthController(
    IAuthService authService,
    AuthCookieService cookieService,
    ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-login")]
    [ProducesResponseType(typeof(AuthTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var issue = await authService.LoginAsync(
                request.UsernameOrEmail,
                request.Password,
                HttpContext.Connection.RemoteIpAddress?.ToString(),
                Request.Headers.UserAgent.ToString(),
                cancellationToken);

            cookieService.SetSessionCookies(Response, issue.RefreshToken, issue.RefreshExpiresAt);
            return Ok(issue.Response);
        }
        catch (AuthException ex) when (ex.Reason is AuthFailureReason.InvalidCredentials or AuthFailureReason.InactiveUser)
        {
            return Unauthorized(CreateProblem(StatusCodes.Status401Unauthorized, "Invalid username or password."));
        }
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = cookieService.ReadRefreshToken(Request);
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            cookieService.ClearSessionCookies(Response);
            return Unauthorized(CreateProblem(StatusCodes.Status401Unauthorized, "Session expired or invalid."));
        }

        try
        {
            var issue = await authService.RefreshAsync(
                refreshToken,
                HttpContext.Connection.RemoteIpAddress?.ToString(),
                Request.Headers.UserAgent.ToString(),
                cancellationToken);

            cookieService.SetSessionCookies(Response, issue.RefreshToken, issue.RefreshExpiresAt);
            return Ok(issue.Response);
        }
        catch (AuthException)
        {
            cookieService.ClearSessionCookies(Response);
            return Unauthorized(CreateProblem(StatusCodes.Status401Unauthorized, "Session expired or invalid."));
        }
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var refreshToken = cookieService.ReadRefreshToken(Request);
        await authService.LogoutAsync(refreshToken, cancellationToken);
        cookieService.ClearSessionCookies(Response);
        logger.LogInformation("Logout completed");
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(AuthenticatedUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = await authService.GetMeAsync(userId, cancellationToken);
        return user is null ? Unauthorized() : Ok(user);
    }

    private ProblemDetails CreateProblem(int status, string detail) =>
        new()
        {
            Status = status,
            Title = status == StatusCodes.Status401Unauthorized ? "Unauthorized" : "Error",
            Detail = detail,
            Instance = HttpContext.Request.Path
        };
}
