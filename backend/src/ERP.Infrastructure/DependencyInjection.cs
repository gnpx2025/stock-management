using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ERP.Application.Abstractions.Health;
using ERP.Application.Auth.Abstractions;
using ERP.Infrastructure.Health;
using ERP.Infrastructure.Identity;
using ERP.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace ERP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured. " +
                "Set ConnectionStrings__DefaultConnection (e.g. on Render) to your PostgreSQL host.");
        }

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.PostConfigure<JwtOptions>(jwt =>
        {
            if (string.IsNullOrWhiteSpace(jwt.SigningKey))
            {
                jwt.SigningKey = "DEV_ONLY_CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_32+";
            }
        });
        services.Configure<RefreshOptions>(configuration.GetSection(RefreshOptions.SectionName));
        services.Configure<AuthSeedOptions>(configuration.GetSection(AuthSeedOptions.SectionName));

        services.AddDbContext<ErpDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsql => npgsql.MigrationsAssembly(typeof(ErpDbContext).Assembly.FullName)));

        services.AddScoped<IPlatformHealthService, PlatformHealthService>();
        services.AddScoped<IAuthPasswordHasher, AuthPasswordHasher>();
        services.AddScoped<IRefreshTokenHasher, RefreshTokenHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddHostedService<AuthUserSeedHostedService>();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<Microsoft.Extensions.Options.IOptions<JwtOptions>>((bearer, jwtAccessor) =>
            {
                var jwt = jwtAccessor.Value;
                bearer.MapInboundClaims = false;
                bearer.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = JwtRegisteredClaimNames.UniqueName,
                    RoleClaimType = ClaimTypes.Role
                };
            });

        services.AddAuthorization();

        return services;
    }
}
