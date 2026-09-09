# Tasks: Angular Material Migration

**Input**: Design documents from `/specs/003-angular-material-migration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested as a TDD phase. Include only fixes for tests broken by the migration plus the quality gates in User Story 4 / polish (FR-024–026).

**Organization**: Tasks are grouped by user story. Foundational Material theme + providers must complete before story work. Screen migration (US2) must finish before PrimeNG packages are removed (US1 cleanup tasks).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/` (Nx — `apps/shell`, `libs/core|ui|shared|contracts`)
- Docs/specs: `docs/`, `specs/001-platform-foundation/`, `specs/002-login-authentication/`
- Feature docs: `specs/003-angular-material-migration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inventory current PrimeNG footprint; allow Material in policy gate; add Angular Material packages

- [x] T001 Inventory every PrimeNG/PrimeIcons/`@primeng` usage under `frontend/apps`, `frontend/libs`, and `frontend/package.json`; append a short checklist to `specs/003-angular-material-migration/research.md` (or a new `specs/003-angular-material-migration/prime-inventory.md`) listing file → component mapping
- [x] T002 Rewrite `frontend/tools/check-no-competing-ui.js` to allow `@angular/material` and `@angular/cdk`, and forbid `primeng`, `primeicons`, `@primeng/*`, `@primeicons/*`, NG-ZORRO, Bootstrap UI packages, and Tailwind (per `specs/003-angular-material-migration/contracts/frontend-ui-contracts.md`)
- [x] T003 Add `@angular/material` (version-aligned with Angular ~22.1) to `frontend/package.json`, run `npm install` in `frontend/`, and ensure Material Icons / Material Symbols font is available for `MatIcon` (via `frontend/apps/shell/src/index.html` and/or `frontend/libs/ui/src/styles/`)

**Checkpoint**: Gate allows Material; Material package installed; inventory complete

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralized Material theme mapped to ERP tokens; notification + UI providers without PrimeNG — required before story UI work

**⚠️ CRITICAL**: No user story UI migration can begin until this phase is complete

- [x] T004 Create Material theme bridge SCSS mapped to existing `--erp-*` tokens (light + `.app-dark`) in `frontend/libs/ui/src/styles/_material-theme.scss`
- [x] T005 [P] Wire Material theme into `frontend/libs/ui/src/styles/index.scss`; keep `_colors.scss` (brand/semantic) and `_tokens.scss` / `_base.scss` as brand token source of truth
- [x] T006 Reimplement `ToastNotificationService` with `MatSnackBar` (honor severity + `lifeMs`) in `frontend/libs/ui/src/lib/notifications/toast-notification.service.ts` while keeping `NotificationHandler` contract in `frontend/libs/core/src/lib/notifications/notification-handler.ts`
- [x] T007 Rewrite `provideErpUi()` in `frontend/libs/ui/src/lib/theme/provide-erp-ui.ts` to register Material/snackbar providers and `NOTIFICATION_HANDLER`; remove `providePrimeNG`, Aura/`@primeng/themes`, and PrimeNG `MessageService`
- [x] T008 Update `frontend/apps/shell/src/styles.scss` to drop `primeicons` import and consume `@erp/ui` styles including the Material theme bridge
- [x] T009 [P] Confirm `ThemeService` + `DARK_MODE_CLASS` (`app-dark`) in `frontend/libs/ui/src/lib/theme/theme.service.ts` still drive dark mode for Material; export surface unchanged from `frontend/libs/ui/src/index.ts`

**Checkpoint**: Shared UI providers and theme are Material-based — Shell templates may still reference PrimeNG until US2

---

## Phase 3: User Story 1 - Remove former UI library / adopt design system (Priority: P1) 🎯 MVP (design-system half)

**Goal**: Angular Material is the primary UI foundation with a single centralized ERP-mapped theme in `@erp/ui`; competing-library policy matches Constitution v3.0.0

**Independent Test**: `npm run check:ui-libs` passes; Material theme lives only under `frontend/libs/ui/src/styles/`; after US2 + T016–T017, package manifests and source search show zero PrimeNG runtime usage

### Implementation for User Story 1

- [x] T010 [US1] Verify no duplicate Material theme definitions under `frontend/apps/**`; Shell only imports shared styles from `@erp/ui` via `frontend/apps/shell/src/styles.scss`
- [x] T011 [P] [US1] Update `frontend/libs/ui/project.json` / TypeScript project references if needed so `@angular/material` compiles cleanly as a dependency of `@erp/ui`
- [x] T012 [US1] Ensure `frontend/libs/ui/src/index.ts` exports `provideErpUi`, `ThemeService`, `DARK_MODE_CLASS`, and `ToastNotificationService` per `specs/003-angular-material-migration/contracts/frontend-ui-contracts.md`
- [x] T013 [US1] Run `npm run check:ui-libs` in `frontend/` and fix any remaining policy mismatches in `frontend/tools/check-no-competing-ui.js` / `frontend/package.json`

**Note**: Package removal tasks T016–T017 run only after US2 screen migration completes (see Dependencies).

**Checkpoint**: Design-system providers/theme/gate ready; package purge deferred until screens migrated

---

## Phase 4: User Story 2 - Keep login and foundation screens working (Priority: P1)

**Goal**: Login, foundation home, global loader, notifications, and routes work on Material; temporary header/aside removed; content-area logout retained

**Independent Test**: Per `specs/003-angular-material-migration/quickstart.md` §4 — login validation + success, foundation health/demo loader/demo notification, content-only shell, logout, routes via direct URL, keyboard focus/labels smoke-check

### Implementation for User Story 2

- [x] T014 [P] [US2] Migrate login template/component from PrimeNG (`Button`, `InputText`, `Password`, `Message`) to `erp-button` + Material form primitives (`MatFormField`, `MatInput`, inline errors, optional password toggle) in `frontend/apps/shell/src/app/features/auth/login/login.ts`, `login.html`, and `login.scss` — preserve validation and auth behavior
- [x] T015 [P] [US2] Migrate foundation home from PrimeNG (`Card`, `Tag`, `Button`) to `erp-card`, `erp-status-chip`, `erp-button`, `erp-icon` in `frontend/apps/shell/src/app/features/foundation-home/foundation-home.ts`, `foundation-home.html`, and related SCSS; keep health/demo loader/demo notification behavior
- [x] T016 [US2] Convert `shell-layout` to content-only Shell: remove temporary header/aside chrome; keep notification capability + `app-global-loader` + `router-outlet` in `frontend/apps/shell/src/app/layout/shell-layout.ts`, `shell-layout.html`, and `shell-layout.scss` (no MatToolbar/MatSidenav ERP layout)
- [x] T017 [US2] Replace `ProgressSpinner` with `erp-spinner` in `frontend/apps/shell/src/app/layout/global-loader.ts|html|scss` without changing `LoadingService` behavior in `frontend/libs/core/src/lib/http/loading.service.ts`
- [x] T018 [US2] Add minimal content-area Logout control on foundation home (`erp-button`) wired to existing logout flow in `frontend/apps/shell/src/app/features/foundation-home/` (and Shell auth services as already used by prior header logout)
- [x] T019 [US2] Remove all remaining PrimeNG imports/selectors/styles from Shell feature/layout files under `frontend/apps/shell/src/app/` (including `::ng-deep` / `.p-password` rules in `login.scss`)
- [x] T020 [US1] Remove `primeng`, `primeicons`, `@primeng/themes`, and unused `@primeuix/themes` from `frontend/package.json`; refresh `frontend/package-lock.json` via `npm install`
- [x] T021 [US1] Search `frontend/apps`, `frontend/libs`, and `frontend/tools` for `primeng|primeicons|@primeng|p-button|p-toast|p-card|p-password|pi pi-` and eliminate remaining runtime/source hits

**Checkpoint**: Shell builds and runs on Material only; content-only layout; logout works; PrimeNG packages gone

---

## Phase 5: User Story 3 - Consume shared UI safely (Priority: P1)

**Goal**: Apps consume `@erp/ui` for theme/notifications and shared `erp-*` presentation components; Material remains the underlying foundation; docs/policy describe Material-first dependency direction

**Independent Test**: Inspect Shell → `@erp/ui` (`erp-*` + theme/tokens) → Material direction; shared components use three-file structure; `docs/frontend-architecture.md` + gate reflect Material-only policy

### Implementation for User Story 3

- [x] T022 [P] [US3] Update `docs/frontend-architecture.md` to state Angular Material + `@erp/ui` as the UI foundation; remove PrimeNG-only / Material-forbidden policy language
- [x] T023 [P] [US3] Confirm Shell imports reusable UI (`provideErpUi`, theme, toast, and `erp-*` components) from `@erp/ui` public API; allow direct Material only for one-off form primitives (e.g. login `MatFormField`/`MatInput`); do not add wrappers that provide no ERP API/styling/composition value
- [x] T024 [US3] Align any README frontend UI blurb that still mandates PrimeNG (if present) with Material-first wording in `README.md` and/or `frontend/README.md` if those files currently prescribe PrimeNG

**Checkpoint**: Consumption rules and developer docs match Constitution v3.0.0

---

## Phase 6: User Story 4 - Prove quality after migration (Priority: P2)

**Goal**: Lint, type-check, build, and tests pass (or document pre-existing unrelated failures); prior specs no longer mandate PrimeNG

**Independent Test**: Commands in `specs/003-angular-material-migration/quickstart.md` §§2–3 and §5 succeed

### Implementation for User Story 4

- [x] T025 [P] [US4] Update conflicting PrimeNG mandates in `specs/001-platform-foundation/spec.md`, `plan.md`, and `research.md` so current requirements align with Angular Material / Constitution v3.0.0 (historical notes OK)
- [x] T026 [P] [US4] Update conflicting PrimeNG mandates in `specs/002-login-authentication/spec.md`, `plan.md`, `research.md`, and `tasks.md` (and checklists if they require PrimeNG controls) to Material-aligned requirement language
- [x] T027 [US4] Fix any unit tests broken by UI migration under `frontend/apps/shell/`, `frontend/libs/ui/`, and `frontend/libs/core/` (update TestBed imports/providers for Material/snackbar; do not weaken auth assertions)
- [x] T028 [US4] Run `npx nx lint shell`, `npx nx lint ui`, `npx nx lint core`, `npx nx build shell`, and affected `nx test` targets from `frontend/`; resolve migration-related failures; document any pre-existing unrelated failures in `specs/003-angular-material-migration/quickstart.md` Notes if needed
- [x] T029 [US4] Execute manual smoke validation from `specs/003-angular-material-migration/quickstart.md` §4 (login, foundation, loader, snackbar, logout, content-only shell, keyboard focus/labels)

**Checkpoint**: Quality gates green; prior specs/docs consistent; quickstart scenarios verified

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup across stories

- [x] T030 [P] Remove dead PrimeNG-specific SCSS/CSS and unused layout classes left after header/aside removal under `frontend/apps/shell/src/app/layout/` and `frontend/libs/ui/src/styles/`
- [x] T031 [P] Double-check `frontend/apps/shell/src/app/app.config.ts` (and related bootstrap) still calls `provideErpUi()` and does not reference PrimeNG
- [x] T032 Run final `rg`/search + `npm run check:ui-libs` + production `npx nx build shell` per acceptance SC-001/SC-002/SC-006 in `specs/003-angular-material-migration/spec.md`

---

## Phase 8: Post-implement refinements (shared ERP UI)

**Purpose**: Capture completed follow-up work that refined Spec Kit after the initial Material migration — shared `erp-*` components, three-file structure, and `_colors.scss`

**Independent Test**: SC-010 + quickstart §4.6; Shell features consume `erp-*` from `@erp/ui`

- [x] T033 [P] Add shared `erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip` under `frontend/libs/ui/src/lib/components/` with separate `.ts`/`.html`/`.scss` each; export from `frontend/libs/ui/src/index.ts`
- [x] T034 [P] Split Shell `global-loader` (and any still-inline shared UI) into `.ts`/`.html`/`.scss`; ensure `erp-*` components do not use inline `template`/`styles`
- [x] T035 Create `frontend/libs/ui/src/styles/_colors.scss` for brand/semantic `--erp-color-*` tokens; wire `_tokens.scss` / theme / component SCSS to consume tokens instead of hardcoded semantic/brand hex
- [x] T036 Update Shell login, foundation-home, and global-loader to consume `erp-*` components from `@erp/ui` (login form-field/input may remain direct Material)
- [x] T037 Sync Spec Kit artifacts (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/frontend-ui-contracts.md`, `quickstart.md`, `prime-inventory.md`, this `tasks.md`) with post-implement refinements
- [x] T038 Create curated layout utilities in `frontend/libs/ui/src/styles/_utilities.scss` (`d-flex`, `d-grid`, `gap-*`, spacing, text helpers); wire into `frontend/libs/ui/src/styles/index.scss` and `frontend/apps/shell/src/styles.scss`
- [x] T039 Apply utilities on Shell login, foundation-home, shell-layout, and global-loader templates; remove duplicated common layout rules from their SCSS; update Spec Kit (FR-016a / SC-011)

**Checkpoint**: Spec Kit and codebase agree on shared ERP UI, file structure, color tokens, and curated utilities

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user story UI work
- **User Story 1 (Phase 3)**: Theme/gate/export tasks after Foundational; **package purge T020–T021 after US2 T014–T019**
- **User Story 2 (Phase 4)**: Depends on Foundational; unblocks US1 package removal
- **User Story 3 (Phase 5)**: Depends on Foundational; ideally after US2 for accurate consumption examples
- **User Story 4 (Phase 6)**: Depends on US1–US3 completion for meaningful green builds
- **Polish (Phase 7)**: Depends on US4
- **Post-implement (Phase 8)**: Depends on Polish / completed migration; documents and implements shared `erp-*` refinements

### User Story Dependencies

- **US1**: Design-system tasks (T010–T013) after Foundational; package removal (T020–T021) after US2 migrations
- **US2**: After Foundational; no dependency on US3/US4
- **US3**: After Foundational; best after US2; refined by Phase 8 `erp-*` components
- **US4**: After US1–US3

### Within Each User Story

- Prefer parallel `[P]` tasks on different files
- Migrate templates before deleting PrimeNG packages
- Fix tests after component imports change
- Docs/spec updates can parallelize with code once behavior is stable

### Parallel Opportunities

- T002 || T003 after T001 (or T003 after T002 if gate runs in CI on install)
- T005 || T009 during Foundational (after T004 exists)
- T014 || T015 during US2 (different feature folders)
- T022 || T023 || T024 during US3
- T025 || T026 during US4
- T030 || T031 during Polish

---

## Parallel Example: User Story 2

```bash
# After Foundational completes, migrate independent screens together:
Task: "Migrate login ... in frontend/apps/shell/src/app/features/auth/login/"
Task: "Migrate foundation home ... in frontend/apps/shell/src/app/features/foundation-home/"

# Then sequentially on shared layout:
Task: "Convert shell-layout to content-only ..."
Task: "Replace ProgressSpinner with MatProgressSpinner ..."
Task: "Add content-area Logout on foundation home ..."
```

---

## Parallel Example: User Story 4

```bash
Task: "Update specs/001-platform-foundation/* PrimeNG mandates"
Task: "Update specs/002-login-authentication/* PrimeNG mandates"
# Then lint/build/tests and quickstart smoke sequentially
```

---

## Implementation Strategy

### MVP First (Design system + working Shell on Material)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational (theme + snackbar + `provideErpUi`)  
3. Complete US2 screen migration (T014–T019)  
4. Complete US1 package purge (T020–T021) + T010–T013  
5. **STOP and VALIDATE**: quickstart §2–4 — MVP = PrimeNG gone, Shell works on Material  

### Incremental Delivery

1. Setup + Foundational → Material providers ready  
2. US2 → User-visible Shell works without PrimeNG components  
3. US1 purge → Packages and source clean  
4. US3 → Docs/consumption policy aligned  
5. US4 + Polish → Lint/build/tests/docs acceptance  
6. Phase 8 → Shared `erp-*` components, three-file structure, `_colors.scss`, `_utilities.scss`, Spec Kit sync  

### Parallel Team Strategy

1. Dev A: Setup gate + Material install; then Foundational theme  
2. Dev B: Snackbar + `provideErpUi` (coordinate with theme)  
3. After Foundational: Dev A login migration; Dev B foundation-home + loader  
4. One owner: shell-layout content-only + package removal  
5. Docs/spec updates in parallel during US4  

---

## Notes

- [P] = different files, no incomplete-task dependencies
- Do **not** implement ERP toolbar/sidenav/navigation menu
- Prefer shared `erp-*` compositions in `libs/ui` for repeated controls; avoid wrappers with no ERP value
- Each `erp-*` component MUST use separate `.ts`/`.html`/`.scss`
- Brand/semantic colors live in `_colors.scss` (`--erp-color-*`)
- Curated layout utilities live in `_utilities.scss` (`d-flex`, `gap-*`, …); not Tailwind
- Theme toggle UI is deferred; `ThemeService` API remains
- Commit after each task or logical group
- Suggested MVP scope: Phases 1–4 through T021 (Material-only working Shell); Phase 8 completes shared ERP UI consistency
