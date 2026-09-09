using ERP.Application.Auth.Abstractions;
using ERP.Domain.Identity;
using ERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ERP.Infrastructure.Identity;

public sealed class AuthUserSeedHostedService(
    IServiceScopeFactory scopeFactory,
    IOptions<AuthSeedOptions> seedOptions,
    IHostEnvironment environment,
    ILogger<AuthUserSeedHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment() && !environment.IsEnvironment("Testing"))
        {
            return;
        }

        var options = seedOptions.Value;
        if (string.IsNullOrWhiteSpace(options.UserName) || string.IsNullOrWhiteSpace(options.Password))
        {
            logger.LogDebug("Auth seed skipped: Authentication:Seed username/password not configured.");
            return;
        }

        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ErpDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IAuthPasswordHasher>();

            await db.Database.MigrateAsync(cancellationToken);

            var normalized = AuthUser.Normalize(options.UserName);
            var existing = await db.AuthUsers
                .FirstOrDefaultAsync(u => u.NormalizedUserName == normalized, cancellationToken);

            if (existing is not null)
            {
                return;
            }

            var utcNow = DateTimeOffset.UtcNow;
            var user = AuthUser.Create(options.UserName, options.Email, "pending", utcNow);
            user.SetPasswordHash(hasher.HashPassword(user, options.Password), utcNow);
            db.AuthUsers.Add(user);
            await db.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Seeded development auth user {UserName}", options.UserName);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Auth seed skipped due to database error (is PostgreSQL running and migrated?).");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
