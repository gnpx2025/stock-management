using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace ERP.IntegrationTests;

public sealed class ErpWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            var connectionString =
                Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? "Host=localhost;Port=5432;Database=erp;Username=erp;Password=erp_dev_password";

            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connectionString,
                ["Cors:AllowedOrigins:0"] = "http://localhost:4200",
                ["Authentication:Jwt:Issuer"] = "erp",
                ["Authentication:Jwt:Audience"] = "erp-shell",
                ["Authentication:Jwt:SigningKey"] = "TEST_ONLY_SIGNING_KEY_AT_LEAST_32_CHARS!",
                ["Authentication:Jwt:AccessTokenMinutes"] = "15",
                ["Authentication:Refresh:CookieName"] = "erp_refresh",
                ["Authentication:Refresh:IndicatorCookieName"] = "erp_auth",
                ["Authentication:Refresh:LifetimeDays"] = "7",
                ["Authentication:Refresh:SameSite"] = "Lax",
                ["Authentication:Refresh:Secure"] = "false",
                ["Authentication:Seed:UserName"] = "admin",
                ["Authentication:Seed:Email"] = "admin@example.com",
                ["Authentication:Seed:Password"] = "ChangeMe!DevOnly1"
            });
        });
    }
}
