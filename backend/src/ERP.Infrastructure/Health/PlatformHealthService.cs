using ERP.Application.Abstractions.Health;
using ERP.Application.Health;
using ERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Infrastructure.Health;

public sealed class PlatformHealthService(
    ErpDbContext dbContext,
    ILogger<PlatformHealthService> logger) : IPlatformHealthService
{
    public async Task<HealthStatusDto> GetPlatformHealthAsync(
        string? correlationId = null,
        CancellationToken cancellationToken = default)
    {
        var checkedAtUtc = DateTimeOffset.UtcNow;
        var api = new ComponentHealthDto("api", PlatformHealthStatus.Healthy, "API is running");

        ComponentHealthDto database;
        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
            database = canConnect
                ? new ComponentHealthDto("database", PlatformHealthStatus.Healthy, "Database is reachable")
                : new ComponentHealthDto("database", PlatformHealthStatus.Unhealthy, "Database is unreachable");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database health check failed");
            database = new ComponentHealthDto("database", PlatformHealthStatus.Unhealthy, "Database is unreachable");
        }

        var overall = database.Status switch
        {
            PlatformHealthStatus.Unhealthy => PlatformHealthStatus.Unhealthy,
            PlatformHealthStatus.Degraded => PlatformHealthStatus.Degraded,
            _ => PlatformHealthStatus.Healthy
        };

        return new HealthStatusDto(overall, checkedAtUtc, api, database, correlationId);
    }
}
