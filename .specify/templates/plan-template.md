# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

Fill from the ERP architecture skills (do not invent a different stack):

**Language/Version**: TypeScript (Angular 22 / strict preference) + C# / .NET 10

**Primary Dependencies**: Angular Material + `@erp/*` libs (Nx); ASP.NET Core + EF Core + Npgsql

**Storage**: PostgreSQL 16 via EF Core migrations

**Testing**: Jest (frontend); xUnit + WebApplicationFactory + NetArchTest (backend)

**Target Platform**: Web SPA (Shell / future MFEs) + REST API

**Project Type**: Monorepo — `frontend/` (Nx) + `backend/` (.NET Clean Architecture modular monolith)

**Performance Goals**: [feature-specific]

**Constraints**: Follow constitution + `.cursor/skills/erp-*`. No competing UI libraries. No MediatR unless explicitly decided. No backend microservices without justification.

**Scale/Scope**: [feature-specific]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Use this monorepo layout. Expand only the paths this feature touches. Do not invent alternate trees.

```text
frontend/
├── apps/shell/src/app/
│   ├── features/          # Feature pages (e.g. auth/login)
│   └── layout/            # Shell chrome (sidebar, topbar, loader)
└── libs/
    ├── contracts/         # Shared DTOs/interfaces (@erp/contracts)
    ├── shared/            # Pure non-UI helpers (@erp/shared)
    ├── core/              # Auth, HTTP, config (@erp/core)
    ├── ui/                # erp-* components + theme SCSS (@erp/ui)
    └── i18n/              # Language catalogs + pipe (@erp/i18n)

backend/
├── src/
│   ├── ERP.Api/           # Controllers, middleware, host
│   ├── ERP.Application/   # Ports, DTOs, exceptions
│   ├── ERP.Domain/        # Entities / domain behavior
│   └── ERP.Infrastructure/# EF Core, auth impl, DI
└── tests/
    ├── ERP.UnitTests/
    ├── ERP.IntegrationTests/
    └── ERP.ArchitectureTests/
```

**Structure Decision**: ERP Angular Nx + .NET Clean Architecture monorepo (see `.cursor/skills/erp-architecture/SKILL.md`). Feature plans MUST place new code in the folders above and MUST NOT redefine the stack.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
