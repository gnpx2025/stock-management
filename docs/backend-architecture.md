# Backend architecture

## Stack

- .NET 10 / ASP.NET Core Web API
- Clean Architecture
- EF Core + Npgsql + PostgreSQL 16
- API versioning `/api/v1`
- Problem Details + correlation IDs
- Health checks for API and database

## Projects

```text
ERP.Api → ERP.Application → ERP.Domain
ERP.Infrastructure → ERP.Application → ERP.Domain
```

| Project | Responsibility |
|---------|----------------|
| ERP.Domain | Domain primitives only (no EF/ASP.NET) |
| ERP.Application | Use-case abstractions / orchestration contracts |
| ERP.Infrastructure | EF Core, Postgres, health service implementations |
| ERP.Api | Endpoints, middleware, DI, CORS, versioning |

## Foundation endpoints

- `GET /api/v1/platform/health` — Shell-facing (503 when Unhealthy)
- `GET /health`, `/health/live`, `/health/ready` — ops probes
- `GET /api/v1/platform/errors/sample` — Development/Testing Problem Details demo

No business APIs or Login in this foundation.

## Tests

- **Unit** — exception handling / correlation
- **Integration** — health + Problem Details via `WebApplicationFactory`
- **Architecture** — NetArchTest layer dependency rules

## Migrations

```bash
export PATH="$HOME/.dotnet:$PATH"
cd backend
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
```
