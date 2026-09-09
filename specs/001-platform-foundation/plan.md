# Implementation Plan: Platform Foundation

**Branch**: `001-platform-foundation` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-platform-foundation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Establish a production-ready ERP monorepo foundation: Nx Angular 21+ Shell with Native Federation and Angular Material shared UI; .NET 10 Clean Architecture API with PostgreSQL/EF Core; Docker Compose Postgres 16; health, CORS, structured logging with correlation IDs; global loading/notifications/theme (light default + OS prefer + Shell switch); CI (GitHub Actions) running lint/typecheck/build/unit/integration against real Postgres. No Login, auth flows, or business modules.

> **Supersession (2026-09-09)**: UI kit is Angular Material (Constitution v3.0.0 / `003-angular-material-migration`).

## Technical Context

**Language/Version**: TypeScript (strict) on Angular 21+; C# / .NET 10 (nullable reference types enabled)

**Primary Dependencies**: Nx; `@angular-architects/native-federation` (major aligned to Angular; use `-v4` package only if required for Angular 21 install); Angular Material + Angular CDK; ASP.NET Core Web API; EF Core + Npgsql; Asp.Versioning (URL segment `v1`); Problem Details / `IExceptionHandler`; NetArchTest (or equivalent) for architecture tests

**Storage**: PostgreSQL 16 (Docker Compose locally; CI service container); EF Core migrations; empty persistence foundation (no business entities)

**Testing**: Frontend — Vitest/Jest per Nx Angular defaults + ESLint + `tsc`; Backend — xUnit, integration tests with Testcontainers or CI Postgres, architecture dependency tests

**Target Platform**: Local developer workstations (macOS/Linux/Windows); Docker for Postgres; GitHub Actions CI; future container orchestration (health endpoints designed for it; no deploy in this feature)

**Project Type**: Monorepo web application (Nx frontend + ASP.NET modular monolith backend)

**Performance Goals**: API + DB health report within 5s when Postgres is up; local platform startup documentable under 30 minutes; no throughput targets (no business traffic yet)

**Constraints**: Constitution v3.0.0 stack and boundaries; Angular Material-only UI kit; no competing UI libraries; no business entities/APIs/Login; secrets never committed; Shell owns layout/theme/loading/notifications; independently buildable MFE path via Native Federation

**Scale/Scope**: One Shell app; foundational libs (`core`, `ui`, `shared`, `contracts`); four backend projects + three test projects; Postgres-only Docker Compose; foundation CI workflow; concise `docs/` + README

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven order: Platform Foundation first | Pass | Matches Constitution X |
| Stack: Angular/Nx/Native Federation/Angular Material/SCSS + .NET 10/Clean Architecture/EF Core/PostgreSQL | Pass | Spec + plan aligned |
| Modular monolith (no microservices split) | Pass | Single API host |
| Shell owns app-level concerns; auth/context placeholders only | Pass | Clarified; Login deferred |
| Shared UI + Angular Material-first; no competing UI libs; no unnecessary wrappers | Pass | FR-006/010 |
| Clean Architecture dependency direction | Pass | Enforced via architecture tests |
| API `/api/v1/...`, validation, Problem Details | Pass | Contracts defined |
| Secrets via env; no committed secrets | Pass | `.env.example` pattern |
| Testing: unit, integration, architecture | Pass | CI includes Postgres integration |
| No premature business features | Pass | Explicit out-of-scope |

**Gate result**: PASS — proceed to Phase 0/1. No unjustified violations.

### Post-Design Constitution Re-Check (Phase 1)

| Gate | Status | Design evidence |
|------|--------|-----------------|
| Stack & modular monolith | Pass | `research.md` §1, §7; structure in this plan |
| Shell ownership; auth placeholders only | Pass | `research.md` §5–6; `data-model.md` AuthPlaceholderContract |
| Angular Material-first; no competing UI / wrappers | Pass | `research.md` §3 (superseded by Material migration) |
| Clean Architecture + architecture tests | Pass | `research.md` §7, §10 |
| `/api/v1`, Problem Details, health | Pass | `contracts/openapi.yaml`, `platform-api.md` |
| Secrets / env configuration | Pass | `research.md` §4, §9; `quickstart.md` §1 |
| No business features | Pass | Empty DbContext; contracts exclude business routes |
| Observability depth | Pass | Structured logging + correlation only (`research.md` §8) |

**Post-design gate result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md                 # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
frontend/                          # Nx workspace
├── apps/
│   └── shell/                     # Native Federation host (dynamic-host)
├── libs/
│   ├── core/                      # HTTP, config, errors, auth/context placeholders
│   ├── ui/                        # Angular Material theme wiring, shared UI styles, minimal shared UI
│   ├── shared/                    # Cross-cutting non-UI helpers
│   └── contracts/                 # Shared TS types/DTOs aligning with API contracts
├── nx.json
├── package.json
└── ...

backend/
├── src/
│   ├── ERP.Api/
│   ├── ERP.Application/
│   ├── ERP.Domain/
│   └── ERP.Infrastructure/
└── tests/
    ├── ERP.UnitTests/
    ├── ERP.IntegrationTests/
    └── ERP.ArchitectureTests/

docker/                            # Optional compose overlays / Postgres notes
docker-compose.yml                 # PostgreSQL 16
docs/                              # Architecture & local-dev guides
.github/workflows/ci.yml           # CI foundation
.gitignore
README.md
specs/                             # Spec Kit (preserved)
.specify/                          # Spec Kit (preserved)
```

**Structure Decision**: Monorepo with `frontend/` (Nx Angular MFE host + libs) and `backend/` (Clean Architecture solution). Matches constitution and spec FR-001. Exact Nx project names may use scoped prefixes (e.g. `shell`, `core-http`) but library *areas* remain `core` / `ui` / `shared` / `contracts`.

## Complexity Tracking

> No constitution violations requiring justification.
