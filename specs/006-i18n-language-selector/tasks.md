# Tasks: Internationalization Language Selector

**Input**: Design documents from `/specs/006-i18n-language-selector/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested as a TDD phase. Validate via [quickstart.md](./quickstart.md); optional focused unit coverage only in polish if useful.

**Organization**: Tasks are grouped by user story. Setup + Foundational (`@erp/i18n` LanguageService, catalogs, translate API, `provideErpI18n`) must complete before story UI work. Runtime switch from topbar (US1) is the MVP; persistence/restore (US2) and shared-state ownership (US3) complete the P1 slice; accessibility/RTL polish (US4) is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/` (Nx — `apps/shell`, `libs/i18n`, `libs/ui`, `libs/contracts`, `libs/core`)
- Feature docs: `specs/006-i18n-language-selector/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create `@erp/i18n` library scaffolding and shared language types

- [x] T001 Generate Nx Angular library `i18n` at `frontend/libs/i18n/` (standalone-capable, Jest + ESLint targets) matching existing shared-lib conventions (`project.json` tags e.g. `type:i18n`, `scope:shared`)
- [x] T002 [P] Add TypeScript path alias `@erp/i18n` → `./libs/i18n/src/index.ts` in `frontend/tsconfig.base.json`
- [x] T003 [P] Add `AppLanguage`, `DocumentDirection`, and `LanguageOption` types in `frontend/libs/contracts/src/lib/language.ts` and export them from `frontend/libs/contracts/src/index.ts`
- [x] T004 Create `frontend/libs/i18n/src/index.ts` public barrel (placeholder exports OK until foundational services land)

**Checkpoint**: `@erp/i18n` project exists and is importable; language types available from `@erp/contracts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared language state, catalogs, direction, and app provider — required before any user story UI

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement Signals-based `LanguageService` in `frontend/libs/i18n/src/lib/language.service.ts`: readonly `language` (`en`|`ar`), derived `direction` (`ltr`|`rtl`), `t(key)` lookup, `setLanguage(lang)` apply path; persist to `localStorage` key `erp.language`; set `document.documentElement.lang` + `dir`; default invalid/missing → `en` (mirror `ThemeService` patterns in `frontend/libs/ui/src/lib/theme/theme.service.ts`)
- [x] T006 [P] Add initial Shell chrome catalog files `frontend/libs/i18n/src/lib/catalogs/en.json` and `frontend/libs/i18n/src/lib/catalogs/ar.json` with key namespaces `shell.topbar.*`, `shell.nav.*`, `shell.language.*`, `auth.login.*` (English + Arabic values; expand keys as stories need them)
- [x] T007 [P] Implement `TranslatePipe` (or equivalent signal-friendly helper) in `frontend/libs/i18n/src/lib/translate.pipe.ts` that resolves keys via `LanguageService` and updates when language changes
- [x] T008 Implement `provideErpI18n()` in `frontend/libs/i18n/src/lib/provide-erp-i18n.ts` so language restores/applies at application startup (including before login)
- [x] T009 On catalog load/switch failure in `LanguageService.setLanguage`, keep prior language/direction and emit brief feedback via existing `NOTIFICATION_HANDLER` / toast pattern (`@erp/core` token + `@erp/ui` MatSnackBar wiring already in Shell); do not crash
- [x] T010 Export `LanguageService`, `provideErpI18n`, `TranslatePipe`, and related public symbols from `frontend/libs/i18n/src/index.ts`
- [x] T011 Register `provideErpI18n()` in `frontend/apps/shell/src/app/app.config.ts` alongside `provideErpCore` / `provideErpUi` (no NgRx; no second language store)

**Checkpoint**: App boots with restored `en`/`ar` + `dir`; `t()` / pipe works against catalogs; failure keeps prior state + toast

---

## Phase 3: User Story 1 - Switch language from the Shell topbar (Priority: P1) 🎯 MVP

**Goal**: Compact MatMenu language selector after Theme; runtime EN↔AR updates Shell chrome strings and LTR/RTL without restart

**Independent Test**: Sign in → language control after Theme shows `🇬🇧 EN` / `🇸🇦 AR` → switch both ways → topbar/sidebar chrome strings + direction update without full restart ([quickstart.md](./quickstart.md) §1–§3)

### Implementation for User Story 1

- [x] T012 [P] [US1] Create presentation-only `erp-language-selector` in `frontend/libs/ui/src/lib/components/language-selector/` (`erp-language-selector.ts|html|scss`): Angular Material `MatMenu`; Inputs for active language + accessible label + options; Output for language change; closed/options display flag + short code only (`🇬🇧 EN`, `🇸🇦 AR` — never `ER`); MUST NOT import `@erp/i18n`
- [x] T013 [P] [US1] Export `ErpLanguageSelectorComponent` from `frontend/libs/ui/src/index.ts`
- [x] T014 [US1] Wire `erp-language-selector` into `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html|ts` immediately after Theme and before Profile; bind `LanguageService.language` / `setLanguage`; pass translated accessible name from `shell.language.*` keys
- [x] T015 [US1] Replace hardcoded topbar chrome strings in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html|ts` (brand title, Search placeholder/aria, Notifications, Theme aria, Profile/Logout labels as applicable) with `@erp/i18n` translations
- [x] T016 [US1] Convert nav labels in `frontend/apps/shell/src/app/layout/nav/shell-nav-menu.data.ts` (and types in `shell-nav.types.ts` if needed) to message keys; resolve via `LanguageService` / translate pipe in `frontend/apps/shell/src/app/layout/shell-sidebar/shell-sidebar.html|ts` including sidebar a11y strings
- [x] T017 [US1] Manually verify runtime EN↔AR switch updates Shell chrome + document direction without restart against FR-001–007 / SC-001–003 / SC-005 using `npx nx serve shell`

**Checkpoint**: MVP demoable — topbar selector switches language and direction for Shell chrome

---

## Phase 4: User Story 2 - Persist and restore language preference (Priority: P1)

**Goal**: `erp.language` survives reload; startup restores valid preference (or English); login strings follow restored language; no selector on login

**Independent Test**: Set AR → reload → Arabic+RTL on login and after auth; clear/invalid storage → English+LTR; login has no language selector ([quickstart.md](./quickstart.md) §4–§5)

### Implementation for User Story 2

- [x] T018 [US2] Confirm/complete persistence contract in `frontend/libs/i18n/src/lib/language.service.ts`: store only `en`|`ar` under `erp.language`; ignore display codes; device-local only (no user-id keying)
- [x] T019 [US2] Translate login copy in `frontend/apps/shell/src/app/features/auth/login/login.html|ts` (labels, validation, button, mapped error strings) via `@erp/i18n`; do **not** add a language selector on login
- [x] T020 [US2] Verify `provideErpI18n()` restore runs for unauthenticated `/login` and authenticated shell so `html[lang]`/`dir` and login/chrome catalogs match persisted preference (adjust initializer order in `frontend/apps/shell/src/app/app.config.ts` or `provide-erp-i18n.ts` if restore races first paint)
- [x] T021 [US2] Manually validate persistence + invalid fallback + login-without-selector against FR-008–009 / SC-004 using browser `localStorage` and reload

**Checkpoint**: Preference restore meets US2; selector remains authenticated-topbar-only

---

## Phase 5: User Story 3 - Shared language state across Shell and MFEs (Priority: P1)

**Goal**: Single `@erp/i18n` ownership; Shell consumes shared state; no duplicate language selectors in business MFEs; future remotes can import the same singleton

**Independent Test**: Ownership review — language logic only in `@erp/i18n`, presentation in `@erp/ui`, selection only in Shell topbar; no per-MFE selectors ([quickstart.md](./quickstart.md) §8; contracts §7)

### Implementation for User Story 3

- [x] T022 [US3] Ensure Shell topbar/sidebar/login only call `LanguageService` from `@erp/i18n` (no parallel Shell-local language store) in `frontend/apps/shell/src/app/layout/shell-topbar/`, `shell-sidebar/`, and `features/auth/login/`
- [x] T023 [P] [US3] Document MFE consumption expectations (shared `@erp/i18n` singleton; no language selectors in Sales/Purchasing/Inventory/Finance/Master Data/Reports/Administration) in `frontend/libs/i18n/README.md` (or short note under `specs/006-i18n-language-selector/contracts/` if README is inappropriate)
- [x] T024 [US3] Review Native Federation sharing readiness for workspace lib `@erp/i18n` in `frontend/apps/shell/federation.config.mjs` / related docs; add a brief note if extra share config is required for remotes (no remote language selectors in this feature)
- [x] T025 [US3] Confirm no language-selector UI was introduced under business feature areas; Shell remains sole selection owner (FR-013–014 / SC-006 / SC-009)

**Checkpoint**: Shared-state architecture meets US3 without MFE catalog work

---

## Phase 6: User Story 4 - Operate the selector accessibly in LTR and RTL (Priority: P2)

**Goal**: Keyboard-operable selector; translated accessible name; same component works in both directions; failure path remains safe

**Independent Test**: Keyboard-only open/select in LTR and RTL; accessible name translates with language; flag is not the only identifier; load-failure keeps prior language + toast ([quickstart.md](./quickstart.md) §6–§7)

### Implementation for User Story 4

- [x] T026 [US4] Bind translated accessible name for `erp-language-selector` from `shell.language.*` catalog keys in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.ts|html` so Arabic uses the Arabic accessible name (not fixed English “Language”)
- [x] T027 [US4] Verify keyboard focus/open/select for MatMenu language control in both `ltr` and `rtl` document directions in `frontend/libs/ui/src/lib/components/language-selector/` and Shell topbar (adjust ARIA / menu positioning if Material overlays misbehave under RTL)
- [x] T028 [US4] Confirm RTL places sidebar on the right and LTR on the left via document `dir` without separate EN/AR sidebar or selector components (`frontend/apps/shell/src/app/layout/shell-layout/` + `shell-sidebar/` — layout redesign out of scope; direction-driven only)
- [x] T029 [US4] Add or complete a unit/harness path to exercise catalog failure → prior language retained + toast in `frontend/libs/i18n/` (or document manual simulation steps in quickstart if harness is impractical); meet FR-007a / SC-003a / SC-007–008

**Checkpoint**: Accessibility + bidirectional behavior meets US4

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and cleanup without scope creep

- [x] T030 [P] Optional unit tests for `LanguageService` persistence/direction/`setLanguage` in `frontend/libs/i18n/src/lib/language.service.spec.ts`
- [x] T031 [P] Optional unit tests for `erp-language-selector` display/options in `frontend/libs/ui/src/lib/components/language-selector/erp-language-selector.spec.ts`
- [x] T032 Run full [quickstart.md](./quickstart.md) validation against the running Shell (`npx nx serve shell`); fix regressions in Shell chrome i18n only
- [x] T033 [P] Smoke auth/routing unchanged: login, logout, existing navigation still work (SC-010); theme toggle still adjacent before language selector
- [x] T034 Confirm scope boundaries: no search/notification/profile/theme/sidebar/topbar-layout redesign; no business-module translation catalogs; no PrimeNG; no NgRx (`specs/006-i18n-language-selector/spec.md` FR-019–020)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP
- **User Story 2 (Phase 4)**: Depends on Foundational; practically after US1 selector exists for end-to-end persist checks (login translation can proceed in parallel with US1 chrome wiring)
- **User Story 3 (Phase 5)**: Depends on US1 wiring existing (shared consumption review)
- **User Story 4 (Phase 6)**: Depends on US1 selector + US2 restore (a11y in both directions)
- **Polish (Phase 7)**: Depends on desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on US2–US4 for MVP switch demo
- **US2 (P1)**: After Foundational; benefits from US1 chrome keys; login translation [P]-friendly vs topbar wiring
- **US3 (P1)**: After US1 Shell consumption exists
- **US4 (P2)**: After US1 (+ ideally US2) for bilingual a11y/RTL checks

### Parallel Opportunities

- T002 / T003 during Setup
- T006 / T007 during Foundational (after T005 API shape is clear, or stub keys first)
- T012 / T013 in parallel before T014 wiring
- T015 topbar strings // T016 sidebar keys (after pipe/service ready)
- T023 // T024 in US3
- T030 // T031 in Polish

---

## Parallel Example: User Story 1

```bash
# Presentation component + export in parallel:
Task: "Create erp-language-selector in frontend/libs/ui/src/lib/components/language-selector/"
Task: "Export ErpLanguageSelectorComponent from frontend/libs/ui/src/index.ts"

# After wiring service exists, chrome string migrations in parallel:
Task: "Translate topbar strings in shell-topbar.html|ts"
Task: "Convert nav labels to keys + resolve in shell-sidebar.html|ts"
```

---

## Parallel Example: User Story 2

```bash
# Login translation can proceed while persistence verification is prepared:
Task: "Translate login copy in features/auth/login/login.html|ts"
Task: "Confirm erp.language persistence contract in language.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`LanguageService` + catalogs + `provideErpI18n`)
3. Complete Phase 3: User Story 1 (selector + Shell chrome switch)
4. **STOP and VALIDATE**: quickstart §1–§3
5. Demo runtime EN↔AR from topbar

### Incremental Delivery

1. Setup + Foundational → shared i18n ready
2. US1 → runtime switch MVP
3. US2 → persistence + login restore
4. US3 → shared ownership / MFE contract clarity
5. US4 → a11y + RTL hardening
6. Polish → quickstart full pass

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Then:
   - Dev A: US1 selector + topbar/sidebar strings
   - Dev B: US2 login translation + restore verification (after catalogs/keys exist)
3. US3/US4 after US1 lands

---

## Notes

- [P] tasks = different files, no dependencies on incomplete siblings
- [Story] labels map to US1–US4 from `spec.md`
- Do not redesign topbar/sidebar layout; only integrate selector and translate chrome
- Do not add ngx-translate, PrimeNG, or NgRx
- Persist `en`/`ar` only under `erp.language`
- Arabic short code is always `AR` (never `ER`)
- Commit after each task or logical group
- Stop at checkpoints to validate independently
