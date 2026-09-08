using NetArchTest.Rules;

namespace ERP.ArchitectureTests;

public sealed class LayerDependencyTests
{
    [Fact]
    public void Domain_Should_Not_Depend_On_Other_Layers()
    {
        var result = Types.InAssembly(typeof(ERP.Domain.AssemblyMarker).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny("ERP.Application", "ERP.Infrastructure", "ERP.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, FormatFailures(result));
    }

    [Fact]
    public void Application_Should_Not_Depend_On_Infrastructure_Or_Api()
    {
        var result = Types.InAssembly(typeof(ERP.Application.AssemblyMarker).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny("ERP.Infrastructure", "ERP.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, FormatFailures(result));
    }

    [Fact]
    public void Infrastructure_Should_Not_Depend_On_Api()
    {
        var result = Types.InAssembly(typeof(ERP.Infrastructure.AssemblyMarker).Assembly)
            .ShouldNot()
            .HaveDependencyOn("ERP.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, FormatFailures(result));
    }

    [Fact]
    public void Api_Should_Reference_Application_And_Infrastructure()
    {
        var references = typeof(Program).Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToArray();

        Assert.Contains("ERP.Application", references);
        Assert.Contains("ERP.Infrastructure", references);
    }

    private static string FormatFailures(TestResult result)
    {
        if (result.FailingTypes is null || !result.FailingTypes.Any())
        {
            return "Architecture rule failed.";
        }

        return "Architecture rule failed for: " + string.Join(", ", result.FailingTypes.Select(t => t.FullName));
    }
}
