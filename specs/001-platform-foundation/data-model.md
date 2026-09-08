# Data Model: Platform Foundation

**Feature**: `001-platform-foundation` | **Date**: 2026-09-08

This foundation has **no business persistence entities**. The model below covers infrastructure and configuration concepts used for contracts, validation, and future extension. EF Core ships an empty `ErpDbContext` ready for later domain entities.

---

## Persistence (EF Core)

### ErpDbContext (foundation)

| Aspect | Rule |
|--------|------|
| Purpose | PostgreSQL connection, migrations pipeline, health check target |
| Entities | None in this feature |
| Migrations | Initial migration allowed to be empty / ensure database creation only |
| Soft delete / audit columns | Not introduced yet |
| Forbidden | Customer, Item, Invoice, Supplier, User, Role, or any business tables |

---

## Conceptual / runtime models

### PlatformEnvironmentConfiguration

Represents named environment settings for frontend and backend.

| Field | Type | Rules |
|-------|------|-------|
| environmentName | string | One of: `Development`, `Testing`, `Staging`, `Production` |
| apiBaseUrl | string (URI) | Required for frontend; absolute base URL without trailing business paths |
| databaseConnectionString | string | Backend only; from env/secrets; never committed |
| corsAllowedOrigins | string[] | Backend; must include local Shell origin(s) in Development |

**Relationships**: Consumed by Shell bootstrap and API host; not persisted as a table in this feature.

---

### HealthStatus

Aggregate operational health for probes and Shell foundation home.

| Field | Type | Rules |
|-------|------|-------|
| status | enum | `Healthy` \| `Degraded` \| `Unhealthy` |
| api | ComponentHealth | Required |
| database | ComponentHealth | Required |
| checkedAtUtc | datetime (UTC) | Required |
| correlationId | string | Optional on response; always present in logs for the request |

### ComponentHealth

| Field | Type | Rules |
|-------|------|-------|
| name | string | e.g. `api`, `database` |
| status | enum | `Healthy` \| `Degraded` \| `Unhealthy` |
| description | string | Safe for clients; no secrets/connection strings |

**State / transitions**: Derived at request time from health checks; not stored.

---

### ThemeProfile

Client-side presentation settings owned by Shell / UI library.

| Field | Type | Rules |
|-------|------|-------|
| mode | enum | `light` \| `dark` |
| followOsPreference | boolean | When true and no explicit user override, initialize from `prefers-color-scheme` |
| darkModeCssClass | string | Document-root class, e.g. `app-dark` |

**Persistence**: Optional `localStorage` key for last explicit choice (implementation detail); not a database entity.

---

### NotificationMessage

Shared notification contract for Toast infrastructure.

| Field | Type | Rules |
|-------|------|-------|
| severity | enum | `success` \| `info` \| `warn` \| `error` |
| summary | string | Short title |
| detail | string | Optional body |
| lifeMs | number | Optional auto-dismiss |

---

### AuthPlaceholderContract

Non-operational placeholders for the Authentication feature.

| Member | Rules |
|--------|-------|
| AuthSession | Interface only; no real tokens issued |
| TokenStorage | Abstraction for future secure storage |
| AuthGuard / PermissionGuard | Stubs; must not enforce real auth in this feature |
| CurrentUser / AppContext | Empty or null-object placeholders |

**Forbidden**: Login flows, JWT issuance/validation, refresh tokens, role/permission data.

---

### ProblemDetailsError (API error envelope)

Aligns with RFC 9457 Problem Details plus platform extensions.

| Field | Type | Rules |
|-------|------|-------|
| type | URI string | Problem type |
| title | string | Short summary |
| status | int | HTTP status |
| detail | string | Safe detail |
| instance | string | Optional |
| correlationId | string | Required extension for platform errors |
| errors | map | Optional validation errors |

---

## Validation summary

- No business entity uniqueness/lifecycle rules in this feature.
- Connection strings and passwords must never appear in HealthStatus or ProblemDetails responses.
- Environment names are a closed set of four values (constitution-aligned).
