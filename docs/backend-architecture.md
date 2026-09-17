# Backend architecture

## Stack

- .NET 10 / ASP.NET Core Web API
- Clean Architecture (modular monolith — no microservices yet)
- EF Core + Npgsql + PostgreSQL 16
- API versioning `/api/v1`
- Problem Details + correlation IDs
- Health checks for API and database
- Cookie + JWT authentication

## Projects

```text
ERP.Api → ERP.Application → ERP.Domain
ERP.Infrastructure → ERP.Application → ERP.Domain
```

| Project | Responsibility |
|---------|----------------|
| ERP.Domain | Domain entities and behavior only (no EF/ASP.NET) |
| ERP.Application | Ports (interfaces), DTOs, application exceptions — no implementations |
| ERP.Infrastructure | EF Core, Postgres, auth/crypto/JWT, health implementations, DI registration |
| ERP.Api | Controllers, middleware, cookies, rate limiting, host composition |

**House style:** thin controllers → Application interfaces → Infrastructure implementations. Do **not** introduce MediatR/CQRS unless a future architecture decision explicitly adopts it.

## Current endpoints

### Platform

- `GET /api/v1/platform/health` — Shell-facing (503 when Unhealthy)
- `GET /health`, `/health/live`, `/health/ready` — ops probes
- `GET /api/v1/platform/errors/sample` — Development/Testing Problem Details demo

### Auth

- `POST /api/v1/auth/login` — rate limited (10/min/IP)
- `POST /api/v1/auth/refresh` — refresh cookie rotation
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me` — `[Authorize]` Bearer JWT

See [authentication.md](authentication.md).

## Extending with a new capability

1. Domain entity (if needed) in `ERP.Domain`
2. Interfaces + DTOs in `ERP.Application`
3. EF configuration + service implementation in `ERP.Infrastructure`
4. Thin controller under `ERP.Api/Controllers/{Feature}/` at `/api/v{version}/…`
5. Keep `ERP.ArchitectureTests` green

## Tests

- **Unit** — crypto / exception handling
- **Integration** — auth + health + Problem Details via `WebApplicationFactory`
- **Architecture** — NetArchTest layer dependency rules

## Migrations

```bash
export PATH="$HOME/.dotnet:$PATH"
cd backend
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
```
