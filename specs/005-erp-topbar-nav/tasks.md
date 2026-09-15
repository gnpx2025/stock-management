# Tasks: ERP Topbar Navigation

**Input**: Design documents from `/specs/005-erp-topbar-nav/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested as a TDD phase. Validate via [quickstart.md](./quickstart.md) scenarios; optional focused unit coverage only in polish if useful.

**Organization**: Tasks are grouped by user story. Component stub + shell-layout scroll restructure (Foundational) must complete before story UI work. Sticky content-column chrome (US1) is the MVP; theme (US3) and profile logout (US4) are the required functional integrations; search/notification placeholders (US2) complete the visual chrome.

**Post-implement (2026-09-10)**: Speckit docs updated for sidenav-matched topbar surface + bottom shadow (no border); dedicated `@erp/ui` `erp-search-input` (custom input + autocomplete, not `erp-form-field`); utilities-first search styling with no search-field background. See `spec.md` Clarifications session “post-implement refinements”.

**Post-implement (2026-09-15)**: Full-width topbar above sidebar; brand moved into topbar; shell layout column (topbar → sidebar + body); icon-button dark-mode token mapping. See `spec.md` Clarifications session “chrome layout refinements”.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/` (Nx — `apps/shell`, `libs/ui`, `libs/core`)
- Feature docs: `specs/005-erp-topbar-nav/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Shell topbar file scaffolding

- [x] T001 Create directory `frontend/apps/shell/src/app/layout/shell-topbar/` with component stubs `shell-topbar.ts`, `shell-topbar.html`, and `shell-topbar.scss` (selector `app-shell-topbar`, `ChangeDetectionStrategy.OnPush`, external `templateUrl`/`styleUrl` matching `shell-sidebar/` naming — not `.component.ts`)

**Checkpoint**: Topbar files exist; no behavior required yet

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire topbar into the content column and restructure scroll so sticky chrome is possible without a second scrollbar

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement minimal standalone `ShellTopbarComponent` host in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.ts|html|scss` (empty/header landmark OK; import nothing beyond what the stub needs)
- [x] T003 Register/import `ShellTopbarComponent` in `frontend/apps/shell/src/app/layout/shell-layout/shell-layout.ts`
- [x] T004 Restructure content column in `frontend/apps/shell/src/app/layout/shell-layout/shell-layout.html`: keep full-height sidebar beside a vertical flex content column containing `<app-shell-topbar />` above a scrollable body that hosts `<router-outlet />` (do not span topbar above the sidebar; do not add topbar to login)
- [x] T005 Update `frontend/apps/shell/src/app/layout/shell-layout/shell-layout.scss` so the shell host stays non-scrolling (`100dvh` / `overflow: hidden`), the content column is a flex column with `min-height: 0`, topbar does not scroll, and **only** the content body uses `overflow-auto` (move page padding such as `p-6` from the outer scrolling main onto the body per [research.md](./research.md) §2)

**Checkpoint**: Authenticated shell shows a topbar host in the content column; login unchanged; single content scrollbar under the topbar

---

## Phase 3: User Story 1 - Sticky topbar visible while scrolling (Priority: P1) 🎯 MVP

**Goal**: Authenticated users always see the topbar at the top of the content column while page content scrolls; sidenav-matched surface + bottom shadow; sidebar coexistence intact

**Independent Test**: Sign in → topbar beside sidebar (not over it); scroll page body — topbar stays; no second scrollbar; surface matches sidenav; bottom shadow, no bottom border ([quickstart.md](./quickstart.md) §2–§3)

### Implementation for User Story 1

- [x] T006 [US1] Style `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.scss` for content-column sticky chrome: height aligned with `--erp-header-height`, sidenav-matched surface background, bottom box-shadow (no bottom border) per [contracts/shell-topbar-contracts.md](./contracts/shell-topbar-contracts.md)
- [x] T007 [US1] Lay out topbar row shell in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html` using existing `@erp/ui` utilities (`d-flex`, `align-items-center`, `justify-content-between`, `gap-*`, horizontal padding) with left and right regions ready for controls
- [x] T008 [US1] Manually verify sticky behavior and sidebar coexistence against FR-001–005 / SC-001 / SC-009 using the running Shell (`npx nx serve shell`); adjust `shell-layout.html|scss` or `shell-topbar.scss` if the body scroll or second scrollbar regresses

**Checkpoint**: Layout MVP demoable — sticky empty/regions topbar with correct separation

---

## Phase 4: User Story 2 - Search and notification placeholders (Priority: P2)

**Goal**: Left search input (editable, non-functional) and right notification control (enabled no-op) with accessible names

**Independent Test**: Type in search — no results/API; activate notification — nothing opens; both have accessible names ([quickstart.md](./quickstart.md) §4–§5)

### Implementation for User Story 2

- [x] T009 [US2] Add UI-only search via `@erp/ui` `ErpSearchInputComponent` (`erp-search-input`) on the left of `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html|ts` with static stub options + local autocomplete; custom input (not `erp-form-field`); accessible label/placeholder; no search API or navigation
- [x] T010 [P] [US2] Add enabled notification `erp-button` (`variant="icon"`, Material `notifications` icon) on the right cluster in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html|ts` with accessible name; click/activate is an explicit no-op (no panel, toast, or menu)
- [x] T011 [US2] Order right-side controls left-to-right as Notification → (theme slot) → (profile slot) in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html` per [research.md](./research.md) §6 (leave empty placeholders/comments for theme/profile until US3/US4 if those stories are not done yet)

**Checkpoint**: Search + notification placeholders meet FR-006/007 and SC-008

---

## Phase 5: User Story 3 - Dark/Light theme toggle (Priority: P1)

**Goal**: Topbar theme control switches Light ↔ Dark via existing `ThemeService` with action affordance

**Independent Test**: Toggle both ways; `app-dark` / appearance updates; control shows next-theme affordance and accessible action name; no second theme system ([quickstart.md](./quickstart.md) §6)

### Implementation for User Story 3

- [x] T012 [US3] Inject existing `ThemeService` from `@erp/ui` into `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.ts` (reuse only; do not add a parallel theme store)
- [x] T013 [US3] Add theme `erp-button` in the right cluster of `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html` between notification and profile slots; bind icon/`ariaLabel` as action affordance from `currentMode()` (dark → `light_mode` / “Switch to light theme”; light → `dark_mode` / “Switch to dark theme”); call `theme.toggle()` on click
- [x] T014 [US3] Confirm theme persistence and apply path remain solely in `frontend/libs/ui/src/lib/theme/theme.service.ts` (no new storage keys or theme architecture in Shell)

**Checkpoint**: Theme toggle meets FR-008–010 and SC-004

---

## Phase 6: User Story 4 - Profile menu and Logout (Priority: P1)

**Goal**: Profile control shows session user name; menu contains Logout only; Logout uses existing `AuthSessionService`

**Independent Test**: Name visible; open menu → Logout only; logout lands on `/login`; keyboard can complete the flow ([quickstart.md](./quickstart.md) §7–§8)

### Implementation for User Story 4

- [x] T015 [US4] Inject `AuthSessionService` from `@erp/core` into `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.ts`; expose display name from `user()?.userName` with fallback `"User"`
- [x] T016 [US4] Add profile trigger showing the display name and Angular Material `MatMenu` with a single Logout item in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html|ts` (import `MatMenuModule` / menu triggers as required; no Profile/Settings/Change Password items)
- [x] T017 [US4] Wire Logout to `auth.logout().subscribe()` in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.ts` (reuse existing clear + `/login` navigation; no new auth system)
- [x] T018 [US4] Verify keyboard open + Logout activation for the Material menu in `frontend/apps/shell/src/app/layout/shell-topbar/` (adjust `aria-label` on the profile trigger if needed for FR-015 / SC-007)
- [x] T019 [US4] Remove duplicate theme toggle and Logout button (and update intro copy that says they remain until toolbar lands) from `frontend/apps/shell/src/app/features/foundation-home/foundation-home.html|ts`; keep unrelated demos; leave diagnostic theme text in the runtime card if desired

**Checkpoint**: Profile + Logout meet FR-011–014; foundation-home no longer duplicates chrome actions

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, scope guardrails, and end-to-end validation

- [x] T020 Audit accessible names/labels for search, notification, theme, and profile controls in `frontend/apps/shell/src/app/layout/shell-topbar/shell-topbar.html|ts` against FR-015 / SC-010 (add `MatTooltip` only if `aria-label` alone is insufficient per team pattern)
- [x] T021 [P] Confirm no search/notification API calls, backend changes, or new theme/auth architecture were introduced; scope matches FR-019 and [contracts/shell-topbar-contracts.md](./contracts/shell-topbar-contracts.md) §3
- [x] T022 [P] Smoke-check existing sidebar behavior still intact (expand/scroll/selection) alongside sticky topbar per SC-009 / [quickstart.md](./quickstart.md) §9
- [x] T023 Run full [quickstart.md](./quickstart.md) validation scenarios against `npx nx serve shell` and fix any regressions in `shell-layout/` or `shell-topbar/`
- [x] T024 [P] Optional: `npx nx build shell --skip-nx-cache` (and `npx nx test shell` only if adding a focused topbar unit test) from `frontend/`

**Checkpoint**: Feature ready for review against spec success criteria

---

## Phase 8: Chrome layout refinements (2026-09-15) ✅

**Purpose**: Full-width topbar, brand ownership, dark-mode icon buttons, Speckit sync

- [x] T025 Restructure `frontend/apps/shell/src/app/layout/shell-layout/` to full-width topbar above sidebar + content body
- [x] T026 Move brand mark + product name into `frontend/apps/shell/src/app/layout/shell-topbar/`
- [x] T027 Map `--mat-sys-on-surface-variant` and `erp-button` icon-variant colors for light/dark in `frontend/libs/ui/src/styles/_material-theme.scss` and `erp-button.scss`
- [x] T028 Update Speckit artifacts (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`) for 2026-09-15 refinements

**Checkpoint**: Speckit docs and shipped full-width chrome aligned

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **User Stories (Phases 3–6)**: All depend on Foundational completion
  - Prefer sequential: US1 → US2 → US3 → US4 (US2 can wait until after US3/US4 if prioritizing functional chrome)
  - US3 and US4 can proceed in parallel after US1 if staffed (different controls in the same `shell-topbar` files — coordinate to avoid edit conflicts)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no dependency on other stories — **MVP**
- **User Story 2 (P2)**: After Foundational (ideally after US1 row layout); independently testable as placeholders
- **User Story 3 (P1)**: After Foundational (needs right cluster from US1; works without US2 if notification slot reserved)
- **User Story 4 (P1)**: After Foundational (needs right cluster; foundation-home cleanup last in this story)

### Within Each User Story

- Layout/structure before controls
- Wire existing services before removing foundation-home duplicates
- Story complete before moving to next priority when working solo

### Parallel Opportunities

- After US1: US3 theme wiring and US4 profile wiring can be split across developers if they avoid colliding on the same template regions
- T010 (notification) is [P] relative to finishing search field internals once the left/right regions exist
- T021 / T022 / T024 polish checks are [P] relative to each other after implementation

---

## Parallel Example: After US1 MVP

```bash
# Developer A — theme (US3):
Task: "Inject ThemeService and add action-affordance toggle in shell-topbar.ts|html"

# Developer B — profile (US4):
Task: "Add MatMenu profile + AuthSessionService logout in shell-topbar.ts|html"
# Then one owner removes foundation-home duplicates (T019)
```

---

## Parallel Example: User Story 2 placeholders

```bash
# After topbar row regions exist:
Task: "Add erp-search-input (UI-only autocomplete stubs) on the left in shell-topbar"
Task: "Add notification icon button no-op on the right in shell-topbar"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (sticky content-column topbar)
4. **STOP and VALIDATE**: [quickstart.md](./quickstart.md) §2–§3
5. Demo layout chrome if ready

### Incremental Delivery (recommended full chrome)

1. Setup + Foundational → topbar host + scroll model
2. US1 → sticky sidenav-matched chrome → MVP layout
3. US3 → theme toggle → first functional integration
4. US4 → profile Logout + remove foundation-home duplicates → session chrome complete
5. US2 → search/notification placeholders → visual completeness
6. Polish → full quickstart pass

### Parallel Team Strategy

1. Team completes Setup + Foundational + US1 together
2. Then:
   - Developer A: US3 theme
   - Developer B: US4 profile/logout (+ foundation-home cleanup)
   - Developer C: US2 placeholders
3. Shared polish against quickstart

---

## Notes

- [P] tasks = different files or clearly separable regions; same-file template edits need coordination
- [Story] label maps task to specific user story for traceability
- Reuse only: `ThemeService`, `AuthSessionService`, `@erp/ui` button/icon/`erp-search-input`, Material `MatMenu` / autocomplete
- Do not: search/notification APIs, new theme/auth systems, bottom border separation, `erp-form-field` for topbar search
- Full-width topbar above sidebar is in scope (2026-09-15 refinement)
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
