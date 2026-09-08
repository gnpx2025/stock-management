namespace ERP.Domain.Common;

/// <summary>
/// Base type for future domain entities. No EF Core or ASP.NET attributes.
/// </summary>
public abstract class Entity
{
    public Guid Id { get; protected set; }
}
