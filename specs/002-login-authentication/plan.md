# Implementation Plan: Login and Authentication

**Branch**: `002-login-authentication` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-login-authentication/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Implement production-ready Login and Authentication on the completed Platform Foundation: Shell login UI (PrimeNG), JWT bearer access tokens (in-memory) with rotating HttpOnly refresh-session cookies, Clean Architecture auth use cases, minimal authenticatable-user persistence, route guards with safe return-URL, HTTP auth interceptor with single-flight refresh, IP/client login rate limiting, seed identity for Dev/Testing, and automated frontend/backend tests—without User Management, RBAC, org context, MFA, or business modules.

## Technical Context

**Language/Version**: TypeScript (strict) on Angular 21+; C# / .NET 10 (nullable reference types enabled)

**Primary Dependencies**: Existing Nx/Angular/Native Federation/PrimeNG stack; ASP.NET Core Authentication JwtBearer; System.IdentityModel.Tokens.Jwt (or equivalent); ASP.NET Core Data Protection / Identity password hasher (`PasswordHasher<T>`) without full Identity UI/UserManager product surface; ASP.NET Core Rate Limiting; EF Core + Npgsql (existing)

**Storage**: PostgreSQL 16 (existing Docker Compose); new auth tables via EF Core migrations (`AuthUser`, `RefreshSession`); hashed refresh token verifiers; no plaintext secrets in repo

**Testing**: Frontend — existing Nx unit test runner + route/interceptor/state specs; Backend — xUnit unit tests, WebApplicationFactory integration tests (extend `ErpWebApplicationFactory`), architecture tests remain green

**Target Platform**: Local Shell (`localhost:4200`) ↔ API (`localhost:5080`) with credentialed CORS; Staging/Production HTTPS; GitHub Actions CI (extend auth test coverage)

**Project Type**: Monorepo web application (Nx frontend + ASP.NET modular monolith) — incremental feature on foundation

**Performance Goals**: Login round-trip usable under SC-002 (&lt;30s end-to-end); access token default ~15 minutes; coordinated single refresh under concurrent 401s; rate limiter protects login without account lockout

**Constraints**: Constitution v2.0.0; do not restructure Platform Foundation except minimal auth touch-points (CORS credentials, bootstrap/routing, replace auth placeholders); Signals-first auth state (no NgRx); PrimeNG-only UI; passwords/tokens never logged; inactive login failures identical to invalid credentials at the client; multiple concurrent sessions; refresh rotation + reuse fails session family; logout revokes current session only

**Scale/Scope**: One Login page; auth API (`login`/`refresh`/`logout` + minimal `me`); Shell route protection + return URL; core auth session/interceptor/guard; two persistence entities; seed user for Dev/Testing; no business modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven order: Authentication after Platform Foundation | Pass | Second constitution item; foundation complete |
| Stack: Angular/Nx/NF/PrimeNG/SCSS + .NET 10/Clean Architecture/EF/PostgreSQL | Pass | No stack change |
| Modular monolith (no microservices) | Pass | Auth in existing API host |
| Shell owns authentication entry, loading, notifications | Pass | Login in Shell; reuse loader/toasts |
| No competing UI libraries; PrimeNG-first | Pass | Login uses PrimeNG + shared UI |
| Signals-first; no unnecessary NgRx | Pass | Auth state via Signals |
| Clean Architecture dependency direction | Pass | Use cases in Application; JWT/hash/persist in Infrastructure; thin Api |
| API `/api/v1/...`, validation, Problem Details | Pass | Auth under `/api/v1/auth/...` |
| Secrets via env; no committed secrets | Pass | JWT signing key + seed password from env/user-secrets |
| AuthN: tokens, refresh, logout, expiration | Pass | Core of this feature |
| AuthZ roles/permissions | Pass (deferred) | Explicitly out of scope; claim extension allowed later |
| Audit: auth events | Pass | Structured security logs; no full audit module |
| Testing: unit + integration | Pass | Spec FR-022 |
| No premature business / User Management | Pass | Minimal AuthUser only |

**Gate result**: PASS — proceed to Phase 0/1. No unjustified violations.

### Post-Design Constitution Re-Check (Phase 1)

| Gate | Status | Design evidence |
|------|--------|-----------------|
| Stack & modular monolith | Pass | `research.md` §1–2; structure below |
| Shell owns auth entry; reuse loader/notifications | Pass | `research.md` §6–7; `quickstart.md` |
| PrimeNG-first; Signals auth state | Pass | `research.md` §6 |
| Clean Architecture + thin controllers | Pass | `research.md` §2; `data-model.md` |
| `/api/v1`, Problem Details, CORS credentials | Pass | `contracts/auth-api.md`, `openapi-auth.yaml` |
| Secrets / cookie / JWT config | Pass | `research.md` §3–5, §9; `quickstart.md` |
| Minimal identity; no RBAC/User Mgmt | Pass | `data-model.md` AuthUser / RefreshSession |
| Refresh rotation, multi-session, rate limit | Pass | Clarifications + `research.md` §4–5, §8 |
| Observability without token leakage | Pass | `research.md` §10 |

**Post-design gate result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-login-authentication/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── auth-api.md
│   ├── frontend-contracts.md
│   └── openapi-auth.yaml
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── apps/shell/
│   └── src/app/
│       ├── features/auth/login/          # Login page (new)
│       ├── app.routes.ts                 # /login public; protect Shell children; returnUrl
│       ├── app.config.ts / bootstrap     # Session restore APP_INITIALIZER / provider
│       └── layout/                       # Optional logout control in Shell chrome
└── libs/
    ├── contracts/                        # LoginRequest/Response, AuthUser, etc.
    ├── core/
    │   └── src/lib/auth/                 # Replace placeholders: session (Signals),
    │                                     # memory access token, interceptor, guards,
    │                                     # auth API client
    └── ui/                               # Reuse PrimeNG wiring; no new UI kit

backend/
├── src/
│   ├── ERP.Api/
│   │   └── Controllers/Auth/             # AuthController (login/refresh/logout/me)
│   ├── ERP.Application/
│   │   └── Auth/                         # Commands/queries, DTOs, validators, ports
│   ├── ERP.Domain/
│   │   └── Identity/                     # AuthUser, RefreshSession (domain concepts)
│   └── ERP.Infrastructure/
│       ├── Identity/                     # Password hasher, JWT, refresh store, seed
│       └── Persistence/                  # EF configs + migration
└── tests/
    ├── ERP.UnitTests/                    # Auth use cases, JWT, refresh rotation
    ├── ERP.IntegrationTests/             # Auth endpoints + [Authorize] me
    └── ERP.ArchitectureTests/            # Unchanged rules must still pass
```

**Structure Decision**: Extend the existing monorepo layout. Replace foundation auth placeholders in `@erp/core` / `@erp/contracts` rather than adding a parallel auth stack. Backend auth lives in Clean Architecture layers under an Identity/Auth vertical slice naming, still inside the single modular monolith. Minimal foundation touch-points: CORS `AllowCredentials`, JWT auth middleware, Shell routes/bootstrap, interceptor registration.

## Complexity Tracking

> No constitution violations requiring justification.
