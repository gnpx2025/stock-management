namespace ERP.Application.Health;

public sealed record HealthStatusDto(
    PlatformHealthStatus Status,
    DateTimeOffset CheckedAtUtc,
    ComponentHealthDto Api,
    ComponentHealthDto Database,
    string? CorrelationId = null);
