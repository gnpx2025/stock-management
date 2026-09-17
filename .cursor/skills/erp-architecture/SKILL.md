---
name: erp-architecture
description: >-
  Authoritative ERP monorepo architecture baseline for stock-management.
  Use when specifying, planning, implementing, reviewing, or cleaning any
  feature. Enforces repository structure, library boundaries, Spec Kit usage,
  and dependency rules so agents do not reinvent the stack.
---

# ERP Architecture Baseline

**Source of truth:** this skill + `.specify/memory/constitution.md` + the
current codebase. Prefer code over stale docs when they conflict; then update
docs/skills to match.

Read companion skills when touching those layers:

- Frontend work → `.cursor/skills/erp-frontend/SKILL.md`
- Backend work → `.cursor/skills/erp-backend/SKILL.md`

## Monorepo layout

```text
frontend/apps/shell          # Angular Shell host (Native Federation ready)
frontend/libs/contracts      # @erp/contracts — DTOs/types only
frontend/libs/shared         # @erp/shared — pure non-UI helpers
frontend/libs/core           # @erp/core — auth, HTTP, config, loading
frontend/libs/ui             # @erp/ui — erp-* components, theme, SCSS
frontend/libs/i18n           # @erp/i18n — catalogs, LanguageService, pipe
backend/src/ERP.Api          # Controllers, middleware, host
backend/src/ERP.Application  # Ports, DTOs, app exceptions
backend/src/ERP.Domain       # Entities / domain behavior
backend/src/ERP.Infrastructure
backend/tests/ERP.*          # Unit, Integration, Architecture
specs/                       # Spec Kit features
.specify/memory/constitution.md
```

## Dependency rules (MUST)

### Frontend

```text
shell → core | ui | i18n | shared | contracts
ui    → core | shared | contracts   (NOT i18n)
i18n  → core | shared | contracts
core  → shared | contracts
shared → contracts
contracts → (none)
```

- Apps MUST NOT import another app’s internals.
- Shared libs MUST NOT import Shell or feature modules.
- Enforce via Nx tags + `@nx/enforce-module-boundaries` in `frontend/eslint.config.mjs`.

### Backend

```text
ERP.Api → ERP.Application → ERP.Domain
ERP.Infrastructure → ERP.Application → ERP.Domain
```

- Domain MUST NOT reference Application, Infrastructure, or Api.
- Application MUST NOT reference Infrastructure or Api.
- Infrastructure MUST NOT reference Api.
- Controllers stay thin; business rules live in Domain / Application ports + Infrastructure services.

## Architecture choices already decided

| Topic | Decision |
|-------|----------|
| Frontend | Angular 22 + Nx + Native Federation host |
| UI | Angular Material + `@erp/ui` wrappers; **no** PrimeNG/NG-ZORRO/Bootstrap UI/Tailwind |
| State | Signals + injectable services; **no** NgRx for Shell UI |
| Backend | .NET 10 Clean Architecture modular monolith |
| API style | REST `/api/v1/...`, Problem Details, correlation IDs |
| DB | PostgreSQL + EF Core migrations |
| Auth | JWT access (memory) + HttpOnly refresh cookie |
| CQRS | **Not** used — ports in Application, impl in Infrastructure |
| Microservices | **Forbidden** unless constitution is amended with justification |

Do **not** introduce a competing pattern without updating constitution + these skills.

## Spec Kit rules (MUST)

When running `/speckit-specify`, `/speckit-plan`, or `/speckit-implement`:

1. Read this skill and the relevant `erp-frontend` / `erp-backend` skill first.
2. Read `.specify/memory/constitution.md`.
3. Inspect existing code before inventing structure.
4. **Reuse** existing libs, components, services, interceptors, and endpoints.
5. Feature specs focus on **WHAT** (workflows, requirements, acceptance criteria).
6. Specs MUST **NOT** redefine architecture, folder trees, UI library choice, state management, styling system, or testing stack — those live here.
7. Plans fill Technical Context from this baseline (see `.specify/templates/plan-template.md`).
8. If a feature truly requires a new architectural pattern, call it out explicitly and update the matching skill + constitution.

## Placement rules

| Kind of change | Put it here |
|----------------|-------------|
| Shared DTO / contract type | `frontend/libs/contracts` and/or `ERP.Application` models |
| HTTP/auth/config cross-cutting | `frontend/libs/core` |
| Reusable UI control / theme | `frontend/libs/ui` |
| Translation keys / language | `frontend/libs/i18n` |
| Shell chrome (nav/topbar) | `frontend/apps/shell/src/app/layout` |
| Shell feature page | `frontend/apps/shell/src/app/features/<feature>` |
| Domain entity | `ERP.Domain` |
| Use-case port / DTO | `ERP.Application` |
| EF / external IO | `ERP.Infrastructure` |
| HTTP endpoint | `ERP.Api/Controllers/<Feature>` |

## Cleanup standards

- Remove unused files only after verifying no references.
- Prefer consolidating to the established pattern over adding a second parallel pattern.
- Do not change business behavior during cleanup unless fixing an architecture defect.
- Do not add abstractions for one-off cases.

## Validation commands

```bash
# Frontend
cd frontend && npm run check:ui-libs
npx nx run-many -t lint,test,build --projects=shell,core,ui,i18n,shared,contracts

# Backend
cd backend && dotnet build ERP.sln && dotnet test ERP.sln
```

## Docs

Keep in sync when architecture changes: `docs/frontend-architecture.md`,
`docs/backend-architecture.md`, `docs/repository-structure.md`, `docs/authentication.md`.
