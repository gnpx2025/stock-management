# Tasks: Platform Foundation

**Input**: Design documents from `/specs/001-platform-foundation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — feature spec explicitly requires frontend unit/component testing foundation and backend unit, integration, and architecture tests (FR-016, FR-026, SC-005, SC-006).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/` (Nx workspace — `apps/shell`, `libs/core|ui|shared|contracts`)
- Backend: `backend/src/ERP.*`, `backend/tests/ERP.*`
- Infra/docs: `docker-compose.yml`, `docker/`, `docs/`, `.github/workflows/`, root `README.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo skeleton, tooling baselines, and empty project containers

- [x] T001 Create monorepo directories `frontend/`, `backend/`, `docs/`, `docker/` and ensure `specs/` + `.specify/` remain intact at repository root
- [x] T002 [P] Create root `.gitignore` covering Node, .NET, IDE, `.env`, user-secrets, and build outputs
- [x] T003 [P] Create root `.env.example` with Postgres name/user/password/port placeholders (no real secrets)
- [x] T004 [P] Create `docker-compose.yml` pinning `postgres:16` with env-based credentials, port mapping, and named volume
- [x] T005 Initialize Nx Angular 21+ workspace under `frontend/` with strict TypeScript, ESLint, and Prettier per current Nx conventions
- [X] T006 Create .NET 10 solution `backend/ERP.sln` with projects `backend/src/ERP.Api`, `backend/src/ERP.Application`, `backend/src/ERP.Domain`, `backend/src/ERP.Infrastructure` and test projects `backend/tests/ERP.UnitTests`, `backend/tests/ERP.IntegrationTests`, `backend/tests/ERP.ArchitectureTests`
- [X] T007 Wire backend project references for Clean Architecture (`ERP.Api` → `ERP.Application` → `ERP.Domain`; `ERP.Infrastructure` → `ERP.Application` → `ERP.Domain`) in `backend/ERP.sln` / `.csproj` files
- [x] T008 [P] Add root `README.md` stub linking to upcoming `docs/` and `specs/001-platform-foundation/quickstart.md`

**Checkpoint**: Repo layout exists; frontend and backend solutions can be opened; Compose file present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared platform plumbing that MUST exist before story-specific work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Generate Nx application `frontend/apps/shell` and libraries `frontend/libs/core`, `frontend/libs/ui`, `frontend/libs/shared`, `frontend/libs/contracts` with strict TS and library tags (`type:core|ui|shared|contracts`, `scope:shared`)
- [x] T010 Configure Nx module boundary / dependency constraints in `frontend/eslint.config.*` or `frontend/.eslintrc.*` so apps consume libs and Shell does not become a dependency of libs
- [x] T011 [P] Add Angular Material (originally PrimeNG/PrimeIcons/`@primeng/themes`; migrated in `003-angular-material-migration`) to `frontend/package.json`; verify competing UI libraries are not dependencies
- [x] T012 [P] Initialize Native Federation on `frontend/apps/shell` as dynamic-host (`federation.config.*`, `federation.manifest.json`) without creating business remotes
- [x] T013 [P] Add frontend runtime config asset `frontend/apps/shell/public/config.json` (or equivalent) plus `AppConfig` types in `frontend/libs/contracts/src/` per `specs/001-platform-foundation/contracts/frontend-contracts.md`
- [x] T014 Implement config loader + `APP_CONFIG` provider in `frontend/libs/core/src/` and wire into `frontend/apps/shell/src/app/app.config.ts`
- [X] T015 [P] Enable nullable reference types and centralize backend package refs (EF Core, Npgsql, health checks, Asp.Versioning, Problem Details) in `backend/src/ERP.*.csproj` / `Directory.Build.props` as appropriate
- [X] T016 Create empty `ErpDbContext` in `backend/src/ERP.Infrastructure/Persistence/ErpDbContext.cs` with DI registration extension in `backend/src/ERP.Infrastructure/DependencyInjection.cs`
- [X] T017 Add EF Core design-time factory / migrations assembly wiring under `backend/src/ERP.Infrastructure/Persistence/` and create initial empty migration under `backend/src/ERP.Infrastructure/Persistence/Migrations/`
- [X] T018 Configure ASP.NET host in `backend/src/ERP.Api/Program.cs` for Development/Testing/Staging/Production, connection string from env, and `appsettings.json` + `appsettings.Development.json.example` (or equivalent examples without secrets)
- [X] T019 [P] Add correlation/request ID middleware in `backend/src/ERP.Api/Middleware/CorrelationIdMiddleware.cs` and structured request logging configuration in `backend/src/ERP.Api/Program.cs`
- [X] T020 [P] Register Problem Details + `IExceptionHandler` in `backend/src/ERP.Api/Infrastructure/ExceptionHandling/` so errors return `application/problem+json` with `correlationId`
- [X] T021 [P] Configure API versioning (`/api/v1`) in `backend/src/ERP.Api/Program.cs` and route conventions under `backend/src/ERP.Api/`
- [X] T022 [P] Configure CORS policy for local Shell origins in `backend/src/ERP.Api/Program.cs` using configuration (not hard-coded production origins)
- [x] T023 Add auth placeholder interfaces only (`IAuthSession`, `ITokenStorage`, no-op guards) in `frontend/libs/core/src/auth/` — no Login UI or JWT logic
- [X] T024 [P] Add backend auth placeholder interfaces (empty) under `backend/src/ERP.Application/Abstractions/Identity/` if needed for future wiring — no implementation

**Checkpoint**: Shell and API projects compile; libs exist; persistence/migrations pipeline exists; cross-cutting API middleware registered

---

## Phase 3: User Story 1 - Bootstrap a workable local platform (Priority: P1) 🎯 MVP

**Goal**: Developer can start Postgres, API, and Shell; see health; prove browser→API connectivity; exercise theme/loader/toasts

**Independent Test**: Follow `specs/001-platform-foundation/quickstart.md` steps 1–5; Shell shows health; CORS works; quality checks run

### Tests for User Story 1

- [X] T025 [P] [US1] Add backend integration test for platform health + DB up/down in `backend/tests/ERP.IntegrationTests/Health/PlatformHealthTests.cs`
- [x] T026 [P] [US1] Add frontend unit/component tests for config loader and health display helpers in `frontend/libs/core/src/` and/or `frontend/apps/shell/src/app/features/foundation-home/`

### Implementation for User Story 1

- [X] T027 [US1] Implement health checks (self + EF/DbContext or Npgsql) and map `/health`, `/health/live`, `/health/ready` in `backend/src/ERP.Api/Program.cs`
- [X] T028 [US1] Implement `GET /api/v1/platform/health` returning `HealthStatus` DTO per `specs/001-platform-foundation/contracts/openapi.yaml` in `backend/src/ERP.Api/Controllers/` or Minimal API endpoints under `backend/src/ERP.Api/Endpoints/Platform/`
- [x] T029 [P] [US1] Add `HealthStatus` / `ComponentHealth` TypeScript models in `frontend/libs/contracts/src/lib/health.ts`
- [x] T030 [US1] Implement platform health API client in `frontend/libs/core/src/http/platform-health.service.ts` using `apiBaseUrl`
- [x] T031 [US1] Implement HTTP interceptor(s) for correlation ID forwarding, global loading refcount, and error→notification bridge in `frontend/libs/core/src/http/`
- [x] T032 [P] [US1] Implement global loader overlay owned by Shell in `frontend/apps/shell/src/app/layout/` consuming core loading state
- [x] T033 [P] [US1] Configure Material SnackBar / notification facade in `frontend/libs/ui/src/` and provide it from `frontend/apps/shell/src/app/app.config.ts` (originally PrimeNG Toast; migrated in `003`)
- [x] T034 [US1] Implement theme service (light default, OS prefer, `.app-dark` toggle) in `frontend/libs/ui/src/theme/` and central SCSS/tokens in `frontend/libs/ui/src/styles/`
- [x] T035 [US1] Build Shell layout chrome (header/sidebar/content) in `frontend/apps/shell/src/app/layout/`
- [x] T036 [US1] Build foundation home page with health status, demo loader/toast actions, and theme switch in `frontend/apps/shell/src/app/features/foundation-home/`
- [x] T037 [US1] Wire Shell root routes in `frontend/apps/shell/src/app/app.routes.ts` to layout + foundation home (no Login routes)
- [x] T038 [US1] Verify Docker Compose Postgres starts and document connection string alignment between `.env.example` and `backend/src/ERP.Api` configuration
- [x] T039 [US1] Ensure `dotnet build` / `dotnet test` (unit smoke) and `npx nx lint/test/build` for shell+libs succeed for the MVP slice

**Checkpoint**: Local platform boots; Shell↔API health works; theme/loader/toasts demonstrable — MVP

---

## Phase 4: User Story 2 - Extend the frontend without restructuring (Priority: P1)

**Goal**: Nx graph, Native Federation host, shared libs, and Angular Material-only UI are clearly extensible for future remotes

**Independent Test**: Inspect `frontend/` project graph; Shell consumes libs; federation host configured; no competing UI libraries; remotes not required yet but extension path documented

### Tests for User Story 2

- [x] T040 [P] [US2] Add lint/boundary smoke or unit test proving Shell imports from `frontend/libs/*` path aliases in `frontend/apps/shell-e2e/` or `frontend/libs/core/src/*.spec.ts`
- [x] T041 [P] [US2] Add package.json assertion script or test that fails if competing UI libraries appear in `frontend/package.json` (supports SC-006 / SC-009; now allows Angular Material and forbids PrimeNG/etc. per `003`)

### Implementation for User Story 2

- [x] T042 [US2] Finalize Native Federation host config and empty/placeholder `frontend/apps/shell/public/federation.manifest.json` documenting future remotes (`master-data`, `finance`, `inventory`, `purchasing`, `sales`, `reports`) without implementing them
- [x] T043 [P] [US2] Flesh out `frontend/libs/ui` exports (theme, toast facade, shared styles only — no unnecessary Material wrappers) in `frontend/libs/ui/src/index.ts`
- [x] T044 [P] [US2] Flesh out `frontend/libs/shared` utilities barrel in `frontend/libs/shared/src/index.ts`
- [x] T045 [P] [US2] Flesh out `frontend/libs/contracts` barrel exporting AppConfig/Health/Notification/Theme/Auth placeholders in `frontend/libs/contracts/src/index.ts`
- [x] T046 [US2] Document Nx tags and how to add a future remote app in `docs/frontend-architecture.md` (stub OK if filled in polish — create file with extension steps)
- [x] T047 [US2] Confirm Shell build remains independently runnable via `npx nx serve shell` / `npx nx build shell` using only shared libs

**Checkpoint**: Frontend foundation is MFE-ready without restructuring

---

## Phase 5: User Story 3 - Extend the backend without restructuring (Priority: P1)

**Goal**: Clean Architecture layers, persistence foundation, versioning, errors, and architecture tests are solid for future domains

**Independent Test**: Solution builds; architecture tests fail on illegal references; health + Problem Details work; no business entities in DbContext

### Tests for User Story 3

- [X] T048 [P] [US3] Implement architecture tests enforcing dependency rules in `backend/tests/ERP.ArchitectureTests/LayerDependencyTests.cs` (Domain independent; Api/Infrastructure direction)
- [X] T049 [P] [US3] Add unit tests for exception handler / correlation enrichment in `backend/tests/ERP.UnitTests/`
- [X] T050 [US3] Add integration test asserting Problem Details + correlation ID on a forced error path in `backend/tests/ERP.IntegrationTests/Errors/ExceptionHandlingTests.cs`

### Implementation for User Story 3

- [X] T051 [P] [US3] Add Application-layer abstractions/placeholders for future use cases under `backend/src/ERP.Application/` (no business use cases yet)
- [X] T052 [P] [US3] Ensure Domain project contains only foundation primitives/placeholders (no EF attributes) under `backend/src/ERP.Domain/`
- [X] T053 [US3] Keep controllers/endpoints thin — move health aggregation orchestration to Application or Infrastructure services under `backend/src/ERP.Application/` / `backend/src/ERP.Infrastructure/` as appropriate
- [X] T054 [US3] Verify migrations apply cleanly to empty schema (`dotnet ef database update`) and DbContext has zero business `DbSet`s in `backend/src/ERP.Infrastructure/Persistence/ErpDbContext.cs`
- [X] T055 [US3] Align API responses with `specs/001-platform-foundation/contracts/openapi.yaml` and keep contract copy in sync under `specs/001-platform-foundation/contracts/` if implementation tweaks naming
- [X] T056 [US3] Confirm structured logs include correlation IDs for requests and errors without logging secrets (spot-check via `backend/src/ERP.Api` logging config)

**Checkpoint**: Backend foundation ready for Authentication / domain modules without layer rewrites

---

## Phase 6: User Story 4 - Onboard via documentation and CI foundation (Priority: P2)

**Goal**: README/docs enable <30-minute setup; CI runs install→lint→typecheck→build→unit→integration against real Postgres

**Independent Test**: New contributor follows README; CI workflow exists and runs integration tests with Postgres service

### Tests for User Story 4

- [x] T057 [US4] Add CI workflow job that fails if backend integration tests cannot reach Postgres service in `.github/workflows/ci.yml`

### Implementation for User Story 4

- [x] T058 [P] [US4] Write `docs/repository-structure.md` describing monorepo layout
- [x] T059 [P] [US4] Write `docs/frontend-architecture.md` (Nx, MFE, UI library, Angular Material rules) — expand if stubbed in T046
- [x] T060 [P] [US4] Write `docs/backend-architecture.md` (Clean Architecture, dependency rules, API conventions)
- [x] T061 [P] [US4] Write `docs/local-development.md` covering Docker Postgres, running API, running Shell, migrations, and tests
- [x] T062 [US4] Expand root `README.md` with prerequisites, quick start, links to `docs/`, and pointer to `specs/001-platform-foundation/quickstart.md`
- [x] T063 [US4] Implement GitHub Actions CI in `.github/workflows/ci.yml`: frontend install/lint/typecheck/build/test; backend restore/build/unit; integration tests with Postgres 16 service; apply migrations before integration tests
- [x] T064 [US4] Ensure example configs (`.env.example`, backend settings examples) are complete and secrets remain untracked via `.gitignore`

**Checkpoint**: Onboarding + CI foundation complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Acceptance sweep and consistency

- [x] T065 [P] Run full validation against `specs/001-platform-foundation/quickstart.md` and fix gaps in docs/scripts
- [x] T066 [P] Confirm no Login/business entities/APIs leaked into `frontend/apps/shell` or `backend/src/ERP.*`
- [x] T067 Verify SC-006 style checks: architecture test catches illegal backend reference; frontend competing-UI check fails when forced
- [x] T068 [P] Normalize formatting (Prettier / `dotnet format`) across `frontend/` and `backend/`
- [x] T069 Final green gate: `docker compose up -d`, API + Shell up, health OK, `dotnet test`, `npx nx run-many -t lint,test,build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — **MVP**
- **User Story 2 (Phase 4)**: Depends on Foundational; ideally after US1 Shell exists (uses same apps/libs)
- **User Story 3 (Phase 5)**: Depends on Foundational; ideally after US1 health endpoints exist (extends/hardens them)
- **User Story 4 (Phase 6)**: Depends on US1–US3 being substantially complete (docs/CI reflect reality)
- **Polish (Phase 7)**: Depends on desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on US2–US4
- **US2 (P1)**: After Foundational — builds on Shell/libs from Setup/Foundation; independently testable as MFE readiness
- **US3 (P1)**: After Foundational — builds on API skeleton; independently testable as Clean Architecture readiness
- **US4 (P2)**: After US1 (required) and preferably US2+US3 so docs/CI match the platform

### Within Each User Story

- Tests (where listed) should be written to fail first where practical, then implementation
- Models/contracts before services/clients
- Services before UI/endpoints wiring
- Story complete before treating the next as done

### Parallel Opportunities

- Phase 1: T002–T004, T008 in parallel after T001
- Phase 2: T011–T013, T015, T019–T022, T024 in parallel once projects exist
- After Foundational: US2 and US3 can proceed in parallel by different developers while US1 finishes connectivity UI
- US1 tests T025–T026 parallel; US2 tests T040–T041 parallel; US3 tests T048–T049 parallel
- US4 docs T058–T061 parallel

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "T025 [US1] backend/tests/ERP.IntegrationTests/Health/PlatformHealthTests.cs"
Task: "T026 [US1] frontend foundation-home / core config tests"

# Parallel UI infrastructure:
Task: "T032 [US1] global loader in frontend/apps/shell/src/app/layout/"
Task: "T033 [US1] toast facade in frontend/libs/ui/src/"
Task: "T029 [US1] HealthStatus types in frontend/libs/contracts/src/lib/health.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T043 [US2] frontend/libs/ui/src/index.ts"
Task: "T044 [US2] frontend/libs/shared/src/index.ts"
Task: "T045 [US2] frontend/libs/contracts/src/index.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T048 [US3] backend/tests/ERP.ArchitectureTests/LayerDependencyTests.cs"
Task: "T049 [US3] backend/tests/ERP.UnitTests/ exception handler tests"
Task: "T051 [US3] backend/src/ERP.Application/ placeholders"
Task: "T052 [US3] backend/src/ERP.Domain/ placeholders"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE** using `specs/001-platform-foundation/quickstart.md` (steps 1–5)
5. Demo runnable Shell + API + Postgres health path

### Incremental Delivery

1. Setup + Foundational → compile-ready platform skeleton
2. US1 → runnable local platform (MVP)
3. US2 → MFE/shared-lib readiness
4. US3 → Clean Architecture + architecture tests hardened
5. US4 → docs + CI with Postgres
6. Polish → full acceptance sweep

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Then:
   - Dev A: US1 (connectivity + Shell home)
   - Dev B: US2 (Nx/MFE/libs)
   - Dev C: US3 (architecture tests + API hardening)
3. Team converges on US4 docs/CI, then Polish

---

## Notes

- [P] = different files, no incomplete dependencies
- Do **not** implement Login, JWT, roles, master data, or business modules
- Prefer Angular Material directly; avoid unnecessary wrappers
- Keep Spec Kit (`specs/`, `.specify/`) intact
- Commit after each task or logical group
- Stop at checkpoints to validate independently
