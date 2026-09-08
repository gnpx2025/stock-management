# Research: Platform Foundation

**Feature**: `001-platform-foundation` | **Date**: 2026-09-08

All Technical Context unknowns resolved. Decisions below guide implementation and tasks.

---

## 1. Frontend workspace and Native Federation

**Decision**: Create `frontend/` as an Nx Angular workspace with a single `shell` application configured as a Native Federation **dynamic-host**. Do not scaffold business remotes yet. Pin `@angular-architects/native-federation` major to the installed Angular major; if Angular 21 tooling requires the documented bridge package `@angular-architects/native-federation-v4`, use that package with identical init schematics—do not use deprecated `@nx/angular` host/remote Module Federation generators.

**Rationale**: Constitution and Nx guidance (Nx 23+) deprecate Angular Module Federation generators; Native Federation is the supported MFE path. Spec requires Shell-only for this feature while preserving future remotes (`master-data`, `finance`, etc.).

**Alternatives considered**:
- Webpack Module Federation via `@nx/angular:host` — rejected (deprecated; conflicts with constitution).
- Scaffold all remotes now — rejected (premature; out of scope).
- Single Angular CLI app without Nx — rejected (constitution requires Nx).

---

## 2. Frontend library layout

**Decision**: Establish Nx libraries under `frontend/libs/` in four areas: `core`, `ui`, `shared`, `contracts`. Use Nx tags (e.g. `type:core`, `type:ui`, `scope:shared`) and enforce dependency constraints so apps depend on libs, not the reverse, and remotes will not import Shell internals.

**Rationale**: Spec FR-008; enables incremental MFEs without restructuring.

**Alternatives considered**:
- One giant `shared` lib — rejected (weak boundaries).
- Deep nested domain libs now — rejected (no business domains yet).

---

## 3. PrimeNG theming and light/dark

**Decision**: Configure PrimeNG via `providePrimeNG` with Aura (or current default preset) from `@primeng/themes`. Set `darkModeSelector` to a document-root class (e.g. `.app-dark`). On first load: prefer `prefers-color-scheme` when practical, otherwise default light; Shell provides a simple toggle that adds/removes the class. Centralize theme tokens/SCSS in `libs/ui`. Do not introduce Tailwind or competing UI kits.

**Rationale**: Matches clarification (light default + OS prefer + Shell switch) and PrimeNG official theming model; avoids unnecessary wrappers.

**Alternatives considered**:
- `darkModeSelector: 'system'` only — rejected (no manual verification switch).
- Custom theme engine without PrimeNG presets — rejected (unnecessary complexity).
- Tailwind alongside PrimeNG — rejected (constitution / FR-006).

---

## 4. Frontend configuration and Shell→API connectivity

**Decision**: Load runtime app config (at least `apiBaseUrl`) at Shell bootstrap from an environment-specific config asset (e.g. `public/config.json` or Nx file replacements per Development/Testing/Staging/Production). Provide typed `APP_CONFIG` injection. Configure backend CORS for local Shell origins. Shell foundation home calls `GET /api/v1/platform/health` through shared HTTP infrastructure (loader + error interceptor + notifications).

**Rationale**: Clarification requires browser→API health success; runtime config avoids rebuilding for URL changes and fits Docker later.

**Alternatives considered**:
- Compile-time `environment.ts` only — weaker for ops; acceptable as secondary but not sole approach.
- Defer CORS until Login — rejected (clarified in scope).

---

## 5. Global loading and notifications

**Decision**: Shell owns a request-refcount (or equivalent) global overlay loader driven by core HTTP interceptor(s). Notifications use PrimeNG Toast (or MessageService) exposed via a small shared notification facade in `ui`/`core`—not per-feature implementations. Foundation home includes demo actions to trigger loader/toast for acceptance.

**Rationale**: Constitution + FR-012/013; minimal custom UI beyond wiring.

**Alternatives considered**:
- Per-component spinners only — rejected (duplicates; Shell must own global loader).
- NgRx for loader state — rejected (unnecessary; Signals suffice).

---

## 6. Auth placeholders

**Decision**: Define TypeScript interfaces/tokens only: auth service stub, token storage abstraction, interceptor hook point, route/permission guard stubs that allow-all or no-op. No Login UI, JWT handling, or refresh flow.

**Rationale**: FR-009 / FR-002; prepares Authentication feature without implementing it.

**Alternatives considered**: IdentityServer/Keycloak scaffolding now — rejected (out of scope).

---

## 7. Backend Clean Architecture solution

**Decision**: Solution under `backend/` with `ERP.Api`, `ERP.Application`, `ERP.Domain`, `ERP.Infrastructure` and test projects as specified. Domain has no EF/ASP.NET references. Application defines interfaces (e.g. unit-of-work/time/logging abstractions only as needed). Infrastructure implements `ErpDbContext` (empty of business entities), Npgsql, migrations. Api wires DI, middleware, versioning, CORS, health, exception handling.

**Rationale**: Constitution IV; FR-017–022.

**Alternatives considered**:
- Vertical slice only without layer projects — rejected (constitution mandates layer projects).
- Multiple DbContexts per domain now — deferred until modular domains exist; start with one foundation context.

---

## 8. API versioning, health, and errors

**Decision**:
- Versioned platform API under `/api/v1/...`.
- Shell-facing: `GET /api/v1/platform/health` returning structured health DTO (API + database status).
- Ops-facing: map ASP.NET health checks at `/health` (and optionally `/health/live`, `/health/ready`) for Docker/CI/orchestration.
- Global exception handling via Problem Details (`application/problem+json`) with correlation/request ID echoed in response extensions and logs.
- Structured logging (built-in `ILogger` + request logging middleware); no OpenTelemetry exporters in this feature.

**Rationale**: Spec FR-023/024/033 and clarifications; separates UI-friendly health from probe endpoints.

**Alternatives considered**:
- Health only at `/health` without versioned DTO — weaker for Shell typing/contracts.
- OpenTelemetry now — deferred per clarification.
- Auto-migrate DB on every API startup — rejected for ERP safety; use explicit `dotnet ef database update` in quickstart (CI applies migrations before integration tests).

---

## 9. PostgreSQL and Docker

**Decision**: Pin `postgres:16` (or `postgres:16-alpine`) in Compose. Env-based `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, port, named volume. Provide `.env.example` (and backend `appsettings.*.example` / user-secrets guidance). Never commit real secrets.

**Rationale**: Spec assumptions + FR-027.

**Alternatives considered**: Postgres 17 — acceptable later with justification; 16 is the locked assumption. `latest` tag — rejected.

---

## 10. Testing and CI

**Decision**: GitHub Actions workflow: install → lint → typecheck → build → unit tests → integration tests. Backend integration tests use a real Postgres service container (same major as Compose). Architecture tests (NetArchTest) assert layer dependency rules. Frontend includes at least smoke unit/component tests for config/theme/loader wiring. Include a deliberate negative architecture test or documented validation exercise for SC-006.

**Rationale**: Clarification requires CI Postgres integration; FR-028/029.

**Alternatives considered**:
- Testcontainers-only locally without CI Postgres — rejected for CI acceptance.
- Skip architecture tests until later — rejected (FR-026).

---

## 11. Documentation

**Decision**: Root README with quick start; `docs/` pages for repo structure, frontend/MFE/UI architecture, backend Clean Architecture, Postgres/Docker, running tests. Keep concise; link to `specs/001-platform-foundation/quickstart.md` for acceptance validation.

**Rationale**: FR-030 / SC-001.

---

## 12. Package/version selection at implement time

**Decision**: Prefer current stable majors compatible with “Angular 21+” and “.NET 10” at implementation date. Record exact versions in lockfiles. If Angular 21 cannot consume `@angular-architects/native-federation` without the `-v4` bridge, treat package rename as a packaging detail, not an architecture change—still Native Federation, still not Module Federation.

**Rationale**: Avoids blocking plan on transient npm naming while honoring constitution wording.
