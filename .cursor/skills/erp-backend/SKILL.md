---
name: erp-backend
description: >-
  .NET Clean Architecture implementation standards for the ERP API. Use when
  building or changing backend endpoints, domain entities, EF persistence,
  auth, validation, or tests. Prescribes layer placement, API conventions,
  and forbids unapproved patterns (MediatR, microservices).
---

# ERP Backend Standards

Read `.cursor/skills/erp-architecture/SKILL.md` first. Follow constitution
principles IV–VIII.

## Stack (fixed)

- .NET **10** / ASP.NET Core Web API
- Clean Architecture modular monolith (not microservices)
- EF Core + Npgsql + PostgreSQL
- URL API versioning `/api/v{version}` (v1)
- Problem Details + `X-Correlation-ID`
- xUnit + `WebApplicationFactory` + NetArchTest

## Layer rules (MUST)

| Project | Put here | Forbidden |
|---------|----------|-----------|
| `ERP.Domain` | Entities, domain behavior | EF attributes, ASP.NET, Infrastructure refs |
| `ERP.Application` | Interfaces (ports), DTOs/records, app exceptions | EF, HTTP, concrete IO |
| `ERP.Infrastructure` | `DbContext`, configurations, migrations, service implementations, options binding | Controllers, referencing Api |
| `ERP.Api` | Controllers, middleware, cookies, rate limiting, `Program.cs` composition | Fat business logic |

Dependency direction is enforced by `backend/tests/ERP.ArchitectureTests`.

## House style for use cases

```text
Controller (thin) → IXxxService (Application) → XxxService (Infrastructure) → ErpDbContext / external IO
```

- Do **not** introduce MediatR, Controllers-as-handlers, or vertical-slice folders unless constitution + skills are updated.
- Prefer `sealed` classes/records and primary constructors.
- Namespaces mirror folders: `ERP.{Layer}.{Feature}`.

## API conventions

- Route prefix: `api/v{version}/...` with `[ApiVersion("1.0")]`
- Controllers under `ERP.Api/Controllers/{Feature}/`
- JSON: camelCase + string enums (`JsonStringEnumConverter`)
- Success: plain JSON DTOs from Application models
- Errors: Problem Details (`application/problem+json`) with `correlationId`
- Validation: DataAnnotations + `ModelState` / `ValidationProblem` (no FluentValidation unless adopted project-wide)
- Auth: JWT Bearer for protected endpoints; refresh via HttpOnly cookie handled by `AuthCookieService`
- Rate limit sensitive anonymous endpoints (see login policy)

### Existing surfaces to reuse

- Auth: `POST /api/v1/auth/{login,refresh,logout}`, `GET /api/v1/auth/me`
- Platform health: `GET /api/v1/platform/health`
- Ops probes: `/health`, `/health/live`, `/health/ready`

Do not invent parallel auth or health mechanisms.

## Persistence

- One `ErpDbContext` in Infrastructure (modular organization inside configurations is fine)
- Table names: snake_case plural (e.g. `auth_users`)
- Add EF migrations in Infrastructure; apply via:

```bash
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
```

- Soft delete only when the business case requires it
- Never expose EF entities directly from controllers — map to Application DTOs

## Auth / security

- Access token: JWT in response body; clients send `Authorization: Bearer`
- Refresh: HttpOnly cookie (`erp_refresh`), rotated with reuse detection
- Indicator cookie `erp_auth` for SPA restore hints
- Passwords: `PasswordHasher<T>`; refresh tokens hashed at rest
- Backend always enforces authorization; frontend checks are UX only
- Secrets via env / user-secrets — do not commit production secrets
- Seed users are Development convenience only

## Configuration

- Options pattern (`IOptions<T>`) for auth/JWT/refresh/seed
- `ConnectionStrings:DefaultConnection` required
- CORS policy `ShellCors` with explicit origins + credentials (never `*`)

## Testing (MUST for non-trivial changes)

| Suite | Purpose |
|-------|---------|
| `ERP.UnitTests` | Domain/crypto/handler logic without full host when practical |
| `ERP.IntegrationTests` | HTTP + DB behavior via `ErpWebApplicationFactory` |
| `ERP.ArchitectureTests` | Layer dependency rules — keep green |

## Adding a new backend capability

1. Domain entity (if needed) in `ERP.Domain/{Feature}`
2. Port + DTOs in `ERP.Application`
3. EF config + service in `ERP.Infrastructure`
4. Register in `DependencyInjection.cs`
5. Thin controller in `ERP.Api`
6. Unit and/or integration tests
7. Update OpenAPI/contracts artifacts in the feature `specs/` folder when applicable

## Anti-patterns

- Business rules in controllers
- Referencing Infrastructure types from Domain/Application (except Api composition root)
- New microservice projects without architectural justification
- MediatR/CQRS “because clean architecture”
- Returning EF entities from API
- Competing exception formats outside Problem Details
- Skipping architecture tests when changing project references
