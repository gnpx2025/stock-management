# Feature Specification: Platform Foundation

**Feature Branch**: `001-platform-foundation`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Establish the initial platform foundation for the ERP application based on the ratified project constitution. This specification is ONLY for the Platform Foundation—Angular/Nx/Native Federation frontend UI foundation, .NET 10 Clean Architecture backend, PostgreSQL, Docker, shared libraries, testing, configuration, and basic CI—without Login, Master Data, Finance, Inventory, Purchasing, Sales, Reports, or other business features."

> **Supersession (2026-09-09)**: Primary UI library is now Angular Material per Constitution v3.0.0 and feature `003-angular-material-migration`. Historical PrimeNG wording below is updated to current requirements.

## Constitution Alignment

This feature is the first item in the constitutionally approved implementation order (Platform Foundation → Authentication / Login → …). Stack and boundary choices below MUST remain consistent with Constitution v2.0.0. Deviations MUST be flagged rather than invented.

**Noted alignment adjustments (not conflicts):**

- Constitution configuration environments include Development, Testing, Staging, and Production. This foundation adopts that set (user wording used “Test”; treated as Testing).
- Constitution assigns Shell ownership of authentication entry and organizational/application context. This foundation establishes Shell layout, theme, loading, notifications, error handling, and **placeholders only** for authentication and application context. Full Login, JWT, roles/permissions, and company/branch/financial-year context are out of scope and reserved for later specifications.
- Constitution Modular Monolith + Clean Architecture is preserved; no backend microservices split.

## Clarifications

### Session 2026-09-08

- Q: For Platform Foundation acceptance, must the Shell be able to call the backend API from the browser (for example a health check), including API base URL configuration and CORS for local development? → A: Yes — Shell must successfully call a backend health (or equivalent) endpoint in local dev
- Q: Should the Platform Foundation CI pipeline run backend integration tests against a real PostgreSQL service (for example a CI database container), or only run unit and architecture tests in CI for now? → A: Yes — CI runs integration tests against a real PostgreSQL service
- Q: Without Login implemented yet, what should the Shell show on first successful start so reviewers can accept the layout, theme, loading, and notification foundations? → A: Minimal layout chrome + foundation home (health status + demo loader/toast hooks)
- Q: How deep should backend observability go in Platform Foundation beyond health checks and request correlation IDs? → A: Structured logging + correlation/request IDs on requests and errors (no metrics/tracing product yet)
- Q: For the Shell theme foundation, what should be the default appearance on first load, and must a developer be able to switch light/dark without a full branding feature? → A: Default light (prefer OS when practical) + simple Shell light/dark switch for verification

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bootstrap a workable local platform (Priority: P1)

As a platform developer, I can clone the repository, start local infrastructure, run the frontend Shell and backend API, and confirm the platform is healthy so I can begin building the next feature (Authentication / Login) on a stable base.

**Why this priority**: Without a runnable monorepo foundation, no subsequent ERP feature can be developed or validated incrementally.

**Independent Test**: Follow README local-setup steps; Shell starts; API starts; PostgreSQL is available via Docker Compose; health checks report healthy; Shell browser call to backend health succeeds; frontend and backend build and unit/architecture smoke tests pass.

**Acceptance Scenarios**:

1. **Given** a clean checkout and required tooling installed, **When** the developer follows documented local setup, **Then** PostgreSQL starts via Docker Compose with persistent storage and environment-based credentials (no production secrets committed).
2. **Given** local infrastructure is running, **When** the developer starts the backend API, **Then** the API starts successfully and exposes a health endpoint that includes API liveness and database connectivity.
3. **Given** local infrastructure is running, **When** the developer starts the frontend Shell, **Then** the Shell shows minimal application chrome (header/sidebar/content foundation) and a foundation home that can display API health status and demonstrate global loading and notification hooks, with a default light theme (OS preference respected when practical) and a simple control to switch light/dark.
4. **Given** Shell and API are both running locally with documented CORS and API base URL configuration, **When** the Shell issues its foundation health (or equivalent) API request, **Then** the browser call succeeds and confirms frontend↔backend connectivity without any business or login endpoints.
5. **Given** the platform is running, **When** the developer runs frontend and backend quality checks (lint/type-check/build/tests as applicable), **Then** those checks complete successfully on the foundation codebase.

---

### User Story 2 - Extend the frontend without restructuring (Priority: P1)

As a frontend developer, I can add a future business micro-frontend and consume shared core/UI/contracts libraries from the Shell-oriented Nx workspace without renaming, splitting, or redesigning the platform layout.

**Why this priority**: Incremental ERP delivery depends on a micro-frontend-ready structure with clear library boundaries from day one.

**Independent Test**: Inspect workspace structure and project graph; Shell consumes shared libraries; Native Federation foundation is present; competing UI libraries are absent; a new app can be planned in the reserved naming space without changing foundation layout.

**Acceptance Scenarios**:

1. **Given** the Nx frontend workspace, **When** a developer inspects applications and libraries, **Then** a Shell application and foundational library areas (`core`, `ui`, `shared`, `contracts` or Nx-equivalent naming) exist and are consumable by the Shell.
2. **Given** the Shell application, **When** a developer reviews UI dependencies, **Then** Angular Material (with Angular CDK) is the primary UI component library and competing UI component libraries (including PrimeNG) are not installed.
3. **Given** the shared UI and theme foundation, **When** a developer applies light or dark theme at the Shell level, **Then** styling remains centralized (no duplicated global/theme styles required per future micro-frontend).
4. **Given** the Native Federation foundation, **When** a developer plans future apps (`master-data`, `finance`, `inventory`, `purchasing`, `sales`, `reports`), **Then** those apps are not required to exist yet, but the architecture clearly allows adding them later without restructuring the monorepo foundation.

---

### User Story 3 - Extend the backend without restructuring (Priority: P1)

As a backend developer, I can build future domain APIs on a Clean Architecture solution that already enforces dependency direction, persistence foundation, API conventions, and error/health infrastructure.

**Why this priority**: Business modules must plug into a stable API and domain organization without reworking layers later.

**Independent Test**: Solution builds; layer projects exist with approved dependency direction; architecture tests (or equivalent boundary checks) fail when illegal dependencies are introduced; API versioning prefix and Problem Details-style errors are in place; EF Core/PostgreSQL foundation exists without business entities.

**Acceptance Scenarios**:

1. **Given** the backend solution, **When** a developer inspects projects, **Then** `ERP.Api`, `ERP.Application`, `ERP.Domain`, `ERP.Infrastructure`, and test projects (`ERP.UnitTests`, `ERP.IntegrationTests`, `ERP.ArchitectureTests`) exist under the approved high-level layout.
2. **Given** the Clean Architecture layout, **When** dependency rules are validated, **Then** Domain remains independent of infrastructure; Application depends on Domain; Api and Infrastructure depend inward toward Application/Domain as approved; controllers remain thin (no business logic placed directly in them).
3. **Given** the API foundation, **When** a client calls foundation endpoints (for example health), **Then** responses follow `/api/v1/...` versioning conventions where applicable, and errors use standardized Problem Details-style responses with a request/correlation identifier.
4. **Given** persistence foundation, **When** a developer reviews database setup, **Then** PostgreSQL + EF Core (Npgsql) configuration, DbContext foundation, and migration support exist, and no business master/transaction entities (Customer, Item, Invoice, etc.) are introduced yet.

---

### User Story 4 - Onboard via documentation and CI foundation (Priority: P2)

As a new contributor or CI pipeline, I can follow concise developer documentation and an initial CI workflow foundation that validates install → lint → type check → build → unit tests → integration tests.

**Why this priority**: Onboarding and regression safety are required for incremental Spec-Driven Development, but full deployment is out of scope.

**Independent Test**: README and docs cover structure and local run steps; CI workflow foundation exists for the validation sequence; secrets are not committed; example configuration files are provided where appropriate.

**Acceptance Scenarios**:

1. **Given** a new developer, **When** they read README and foundational docs, **Then** they can find repository structure, frontend/backend/MFE/UI architecture overview, PostgreSQL/Docker setup, and how to run frontend, backend, and tests.
2. **Given** the repository, **When** CI foundation runs on a change, **Then** it validates install, lint, type check, build, unit tests, and integration tests, with backend integration tests executing against a real PostgreSQL service in CI (deployment pipelines are not required).
3. **Given** configuration examples, **When** a developer configures Development/Testing/Staging/Production settings, **Then** secrets remain outside source control and environment-based configuration is used for both frontend and backend.

---

### Edge Cases

- What happens when PostgreSQL is unavailable? Health checks report unhealthy database connectivity; API remains diagnosable without exposing secrets.
- What happens when a frontend HTTP call fails? Centralized error-handling foundation can surface a user-friendly notification path without feature-specific handlers.
- What happens when the API is down but the Shell is up? The Shell’s foundation health call fails visibly through centralized error/notification handling; CORS/base-URL misconfiguration is distinguishable via documented local setup checks.
- What happens if someone introduces a competing UI library or illegal backend layer dependency? Quality gates (lint/dependency/architecture checks) fail where practical.
- What happens if environment configuration is missing? Applications fail fast with clear configuration errors rather than silently using production-like secrets.
- What happens if global loading is triggered with no active requests / overlapping requests? Loader foundation supports request-driven overlay behavior without duplicating loaders per app (exact debounce/refcount behavior may be refined later without changing ownership).

## Requirements *(mandatory)*

### Functional Requirements

#### Repository and scope

- **FR-001**: System MUST provide a monorepo layout separating `frontend/`, `backend/`, `specs/`, `.specify/`, `docs/`, `docker/` (or equivalent), root `docker-compose.yml`, `.gitignore`, and `README.md`, preserving Spec Kit structure.
- **FR-002**: This feature MUST NOT implement Login UI/workflow, JWT/refresh-token auth, user registration, roles/permissions, organization/company/branch/financial-year management, master data, finance, inventory, purchasing, sales, reports, payments, approvals, document numbering business logic, or audit business functionality.
- **FR-003**: Future ERP modules MUST be addable incrementally without restructuring the platform foundation.

#### Frontend platform

- **FR-004**: Frontend MUST be an Nx workspace supporting multiple applications, shared libraries, micro-frontends, library boundaries, project graph, build caching, testing, linting, and future CI integration.
- **FR-005**: Frontend MUST use Angular 21+, strict TypeScript, standalone components, Signals, RxJS, SCSS, Native Federation (`@angular-architects/native-federation`), and Angular Material as the primary UI component library, following current Nx/Angular conventions (not deprecated Module Federation approaches).
- **FR-006**: Frontend MUST NOT use PrimeNG, NG-ZORRO, Bootstrap UI components, Tailwind CSS, or other competing UI component libraries.
- **FR-007**: System MUST provide an initial Shell application responsible for bootstrap, root routing, global layout foundation, global theme configuration, shared UI integration, global loading infrastructure, global notification infrastructure, and application configuration. On first start (without Login), the Shell MUST present minimal application chrome (header/sidebar/content foundation) and a foundation home that shows API health status and provides demo hooks for global loading and notifications. This home MUST NOT implement Login or business features.
- **FR-008**: System MUST establish foundational library areas for `core`, `ui`, `shared`, and `contracts` (exact Nx naming may follow current conventions) consumable by the Shell.
- **FR-009**: Core library area MUST reserve cross-cutting infrastructure for HTTP, configuration, error handling, routing infrastructure, application context foundation, and authentication/permission infrastructure **placeholders only** (no real authz implementation).
- **FR-010**: UI library MUST be the shared UI foundation based on Angular Material; create only the foundation required now; use Angular Material directly where appropriate; avoid unnecessary wrappers; add custom shared components only when Material does not already provide the need; keep reusable component styles inside the UI library.
- **FR-011**: System MUST establish centralized theme/styling architecture (Angular Material theme mapped to ERP design tokens, Material icons, SCSS, design tokens/CSS custom properties where appropriate) supporting light and dark themes, consistent typography/spacing/radius/component styling, and future branding customization without per-micro-frontend global style duplication. Default appearance MUST be light theme, preferring OS color-scheme when practical. The Shell MUST provide a simple light/dark switch for verification (may be deferred when temporary chrome is removed in later UI migrations). Full branding/settings product UI is out of scope.
- **FR-012**: Shell MUST own global loading infrastructure so future apps/shared HTTP infrastructure can trigger a global overlay loader for active API requests without duplicating loader implementations.
- **FR-013**: System MUST establish shared notification infrastructure (success, warning, information, error) via Angular Material (or an ERP facade over Material) for consistent use by future feature applications.
- **FR-014**: Frontend MUST provide centralized HTTP error-handling foundation integrated with user-friendly notifications.
- **FR-015**: Frontend MUST provide environment-based configuration suitable for Angular/Nx across Development, Testing, Staging, and Production, without committing secrets. Configuration MUST include the backend API base URL used by the Shell.
- **FR-016**: Frontend MUST establish unit/component testing foundation, linting, and type checking.
- **FR-032**: In local development, the Shell MUST successfully call a backend health (or equivalent foundation) endpoint from the browser. The platform MUST provide the CORS and API base URL configuration required for that call. This connectivity check MUST NOT require Login or any business API.

#### Backend platform

- **FR-017**: Backend MUST use .NET 10, ASP.NET Core Web API, C# with nullable reference types, Clean Architecture, EF Core, PostgreSQL, and REST APIs.
- **FR-018**: Backend MUST provide projects `ERP.Api`, `ERP.Application`, `ERP.Domain`, `ERP.Infrastructure` and tests `ERP.UnitTests`, `ERP.IntegrationTests`, `ERP.ArchitectureTests`.
- **FR-019**: Backend MUST enforce dependency direction: Api → Application → Domain; Infrastructure → Application → Domain; Domain independent of infrastructure concerns.
- **FR-020**: API layer MUST contain endpoints, API configuration, middleware, DI composition, and API-specific concerns only; business logic MUST NOT live in controllers.
- **FR-021**: Application layer MUST contain use-case/orchestration foundations; Infrastructure MUST contain EF Core, PostgreSQL persistence, and other infrastructure implementations.
- **FR-022**: Persistence foundation MUST include DbContext foundation, connection configuration, EF Core migrations support, and development database configuration, without business entities such as Customer, Item, Invoice, or Supplier.
- **FR-023**: REST API foundation MUST use `/api/v1/...` versioning and establish consistent responses, validation foundation, global exception handling, Problem Details/error responses, request correlation, and health checks.
- **FR-033**: Backend MUST provide structured application logging that includes correlation/request identifiers on requests and errors. Logs MUST NOT expose secrets or sensitive credentials. Full metrics/tracing product integration (for example OpenTelemetry exporters) is out of scope for this foundation.
- **FR-024**: Backend MUST provide health checks covering at least API health and database connectivity, suitable for local development, Docker, CI, and future orchestration. Health endpoints used for the Shell connectivity check MUST be callable from the local Shell origin via documented CORS policy (no authentication required for this foundation check).
- **FR-025**: Backend MUST use ASP.NET Core environment-based configuration for Development, Testing, Staging, and Production without committing secrets; provide example configuration files where appropriate.
- **FR-026**: Backend testing foundation MUST include unit, integration, and architecture tests; architecture tests SHOULD enforce Clean Architecture dependency rules.

#### Infrastructure, quality, docs

- **FR-027**: Docker Compose MUST provide local PostgreSQL with a pinned major version (not `latest`), configurable database name/username/password/port, persistent volume, and environment-based configuration; no hard-coded production secrets.
- **FR-028**: Repository MUST include `.gitignore`, README, foundational developer documentation, and an initial CI workflow foundation covering the validation sequence: install → lint → type check → build → unit tests → integration tests. Backend integration tests in CI MUST run against a real PostgreSQL service (for example a CI database container). Deployment infrastructure is out of scope.
- **FR-029**: Platform MUST configure strict TypeScript, ESLint, Prettier, strict C# nullable reference types, consistent formatting, and fail CI/build checks on architectural or type-safety violations where practical.
- **FR-030**: Documentation MUST concisely describe repository structure, frontend architecture, backend architecture, micro-frontend architecture, UI library architecture, local development setup, PostgreSQL setup, and how to run frontend, backend, and tests.
- **FR-031**: Platform MUST enforce architecture boundaries: apps consume shared libraries rather than duplicating infrastructure; micro-frontends remain independently buildable/deployable; shared UI is centralized; Angular Material is the only approved primary UI component library; business logic stays out of UI components; backend controllers stay thin; domain stays infrastructure-independent.

### Key Entities *(infrastructure concepts)*

- **Platform Environment Configuration**: Named environment settings (Development, Testing, Staging, Production) for frontend and backend connectivity and feature flags; excludes committed secrets.
- **Health Status**: Aggregate platform health including API liveness and database connectivity for operational checks.
- **Theme Profile**: Light/dark (and future brand) presentation settings owned centrally by Shell/UI foundation.
- **Shared UI Contract**: Reusable UI building blocks and notification/loading integration points consumed by Shell and future micro-frontends.
- **Auth Placeholder Contract**: Interfaces/abstractions reserved for future authentication and permission features (no operational login behavior in this feature).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer new to the repo can complete local platform startup (infrastructure + Shell + API) using only repository documentation in under 30 minutes on a standard development machine.
- **SC-002**: Shell application starts successfully and presents minimal layout chrome plus a foundation home with theme, loading, and notification foundations demonstrable on first run (including API health status display). Default theme is light (OS preference respected when practical), and a simple Shell control can switch light/dark for verification.
- **SC-013**: A developer can switch between light and dark themes from the Shell without leaving the foundation home, and theme styling remains centralized (no per-app theme duplication required).
- **SC-003**: Backend API starts successfully and health checks report API and database status within 5 seconds under normal local conditions when PostgreSQL is available.
- **SC-004**: When PostgreSQL is stopped, health checks clearly report database failure without crashing the developer’s ability to diagnose the issue.
- **SC-005**: Frontend and backend each complete install/lint/type-check/build and foundation test suites successfully in a single CI run of the foundation codebase, including backend integration tests against a real PostgreSQL service.
- **SC-006**: Architecture boundary checks detect at least one representative illegal backend dependency and one representative frontend boundary/UI-policy violation during validation exercises.
- **SC-007**: Repository contains zero committed production secrets, and example/env templates are sufficient for a developer to configure local credentials without reading source code.
- **SC-008**: Adding a future named micro-frontend or backend domain module does not require renaming or splitting the established `frontend/` / `backend/` foundation layout.
- **SC-009**: No competing UI component library is present in frontend dependencies at feature completion.
- **SC-010**: No business master/transaction entities or Login/Authentication user flows are shipped as part of this feature’s acceptance.
- **SC-011**: With Shell and API running locally per README, the Shell successfully completes at least one browser call to a backend health (or equivalent) endpoint, proving API base URL and CORS configuration work without Login.
- **SC-012**: For a sample failing or exceptional API request in local development, logs include a correlation/request identifier that can be matched to the client-visible error/Problem Details response.

## Assumptions

- Repository root remains the current project root; the `erp-platform/` label in the request is the logical product name/layout intent, not a mandatory filesystem rename.
- PostgreSQL major version is pinned to **16** for local Docker unless planning later selects another supported LTS major with explicit justification.
- CI foundation targets **GitHub Actions** workflow files unless the repository standardizes on another host later.
- Backend integration tests run in CI against a real PostgreSQL service as part of Platform Foundation acceptance.
- “Test” in the user request maps to constitution **Testing**; **Staging** is included per constitution.
- Native Federation is configured for the Shell now; remote business micro-frontends are not generated until their feature specs.
- Local Shell→API health connectivity (including CORS and API base URL) is required for Platform Foundation acceptance; no business APIs or Login are required for that check.
- Auth/permission/application-context items in Core/Shell are interfaces, stubs, or empty extension points only.
- Shell first-run UX is minimal layout chrome plus a foundation home (API health status and demo loader/toast hooks), not a finished product UI and not Login.
- Theme default is light, preferring OS color-scheme when practical, with a simple Shell light/dark switch for verification; full branding/settings UI remains out of scope.
- Minimal UI foundation may include a small set of shared patterns (for example toast/notification wiring and theme tokens) rather than a full ERP component catalog.
- Architecture tests may start with a focused rule set and expand as modules grow.
- Backend observability for this foundation is structured logging plus correlation/request IDs; metrics/tracing exporters are deferred.
- Spec Kit (`specs/`, `.specify/`) remains untouched in role and continues to govern incremental feature delivery.
- No deployment, Kubernetes, or cloud provisioning is included.
