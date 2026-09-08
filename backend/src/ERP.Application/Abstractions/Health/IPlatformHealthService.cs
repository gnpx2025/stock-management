using ERP.Application.Health;

namespace ERP.Application.Abstractions.Health;

public interface IPlatformHealthService
{
    Task<HealthStatusDto> GetPlatformHealthAsync(
        string? correlationId = null,
        CancellationToken cancellationToken = default);
}
