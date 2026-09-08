namespace ERP.Application.Health;

public sealed record ComponentHealthDto(
    string Name,
    PlatformHealthStatus Status,
    string? Description = null);
