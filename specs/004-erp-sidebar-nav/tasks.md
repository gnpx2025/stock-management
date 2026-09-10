# Tasks: ERP Sidebar Navigation

**Input**: Design documents from `/specs/004-erp-sidebar-nav/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested as a TDD phase. Validate via [quickstart.md](./quickstart.md) scenarios; optional focused unit coverage only in polish if useful.

**Organization**: Tasks are grouped by user story. Foundational types + static menu data + component shells must complete before story UI work. Layout (US1) is the MVP chrome; hierarchy (US2), expand/collapse (US3), and initial collapsed state (US4) layer on top.

**Post-implement (2026-09-10)**: Speckit docs updated for US5 + UX refinements (icons, tree rails, leaf selection persistence, layout folders, utilities). See `spec.md` Clarifications session “post-implement refinements”.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/` (Nx — `apps/shell`, `libs/ui`)
- Feature docs: `specs/004-erp-sidebar-nav/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Shell layout/nav file scaffolding for the sidebar feature

- [x] T001 Create directory `frontend/apps/shell/src/app/layout/nav/` and empty stubs `shell-nav.types.ts` and `shell-nav-menu.data.ts`
- [x] T002 [P] Create component stubs (separate `.ts` / `.html` / `.scss`) for `frontend/apps/shell/src/app/layout/shell-sidebar.ts|html|scss` and `frontend/apps/shell/src/app/layout/shell-sidebar-nav.ts|html|scss` with selectors `app-shell-sidebar` and `app-shell-sidebar-nav`

**Checkpoint**: Layout/nav files exist; no behavior required yet

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Typed static menu model and Shell wiring so user stories can implement UI against real data and hosts

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Define `NavSection` and `NavNode` types per `specs/004-erp-sidebar-nav/data-model.md` in `frontend/apps/shell/src/app/layout/nav/shell-nav.types.ts`
- [x] T004 Encode the full clarified hierarchy as exported `SHELL_NAV_MENU: NavSection[]` in `frontend/apps/shell/src/app/layout/nav/shell-nav-menu.data.ts` (nine sections in order; ADMINISTRATION sibling Audit Trail / System Settings; REPORTS leaves + Supplier Reports → Management Reports; MASTER DATA Finance sibling of Organization)
- [x] T005 Implement minimal standalone `ShellSidebarComponent` host in `frontend/apps/shell/src/app/layout/shell-sidebar.ts|html|scss` that projects/hosts a brand header region and a nav slot (render `<app-shell-sidebar-nav />`)
- [x] T006 Implement minimal standalone `ShellSidebarNavComponent` in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.ts|html|scss` that imports `SHELL_NAV_MENU` (empty or placeholder template OK until US2)
- [x] T007 Register/import `ShellSidebarComponent` in `frontend/apps/shell/src/app/layout/shell-layout.ts` and place `<app-shell-sidebar />` beside main content in `frontend/apps/shell/src/app/layout/shell-layout.html` (do not add sidebar to login; leave `frontend/apps/shell/src/app/app.routes.ts` auth/guest structure unchanged)

**Checkpoint**: Authenticated shell shows a sidebar host; login still outside layout; menu data compiles

---

## Phase 3: User Story 1 - Full-height sidebar with fixed logo and scrollable menu (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see a full-viewport-height sidebar with a fixed brand-only header and an independently scrollable navigation area

**Independent Test**: Sign in → sidebar fills viewport height; header shows brand/product name only; overflow the nav area and scroll — header stays fixed ([quickstart.md](./quickstart.md) §2)

### Implementation for User Story 1

- [x] T008 [US1] Update `frontend/apps/shell/src/app/layout/shell-layout.html` and `shell-layout.scss` to a full-viewport-height horizontal shell (`100vh` / `100dvh` as appropriate): sidebar | main content; main fills remaining width (relax prior content-only max-width centering that fights the sidebar)
- [x] T009 [US1] Style `frontend/apps/shell/src/app/layout/shell-sidebar.scss` so the aside uses `--erp-sidebar-width`, spans full shell height, and uses a column flex layout with `flex-shrink: 0` header and `overflow-y: auto` navigation region
- [x] T010 [US1] Render brand-only header content (logo mark and/or product name text; no theme toggle, logout, or other actions) in `frontend/apps/shell/src/app/layout/shell-sidebar.html`
- [x] T011 [US1] Ensure scrolling the navigation region in `frontend/apps/shell/src/app/layout/shell-sidebar.html|scss` does not move or clip the header (layout contract in `specs/004-erp-sidebar-nav/contracts/shell-sidebar-contracts.md`)

**Checkpoint**: Layout MVP demoable with fixed brand header + scrollable nav host (menu content may still be incomplete)

---

## Phase 4: User Story 2 - Complete menu hierarchy with section headers (Priority: P1)

**Goal**: All nine section headers appear in order as non-interactive labels; full clarified hierarchy is reachable under each section without redundant section-name duplicates

**Independent Test**: Walk OPERATIONS→UTILITIES headers; headers do not expand/collapse; expand paths to spot-check nesting per [quickstart.md](./quickstart.md) §3 and §7 (expand UI may land in US3 — if US3 not done yet, temporarily reveal children for review or complete US3 next)

### Implementation for User Story 2

- [x] T012 [US2] Render ordered section headers from `SHELL_NAV_MENU` as non-interactive labels (not buttons/toggles) in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.html`
- [x] T013 [US2] Recursively (or depth-indented) render `NavNode` labels under each section in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.html` with progressive indentation via tokens/utilities in `shell-sidebar-nav.scss`
- [x] T014 [US2] Wire template bindings in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.ts` to `SHELL_NAV_MENU` from `frontend/apps/shell/src/app/layout/nav/shell-nav-menu.data.ts`
- [x] T015 [P] [US2] Audit `frontend/apps/shell/src/app/layout/nav/shell-nav-menu.data.ts` labels against `specs/004-erp-sidebar-nav/spec.md` Key Entities (no redundant “Sales” under SALES; PURCHASING Reports under Transactions; SALES/INVENTORY Reports under Operations; Cash & Bank → Reports leaf)
- [x] T016 [P] [US2] Confirm clarified edges in data: ADMINISTRATION Audit Trail + System Settings siblings; REPORTS five leaf hubs + Supplier Reports → Management Reports; MASTER DATA Finance sibling of Organization in `frontend/apps/shell/src/app/layout/nav/shell-nav-menu.data.ts`

**Checkpoint**: Full hierarchy present under non-expandable section headers

---

## Phase 5: User Story 3 - Expand and collapse nested menu groups (Priority: P1)

**Goal**: Nodes with children show expand/collapse controls; Signal-backed toggles; keyboard Enter/Space; indentation communicates depth; multiple siblings may stay expanded

**Independent Test**: From collapsed groups, expand/collapse with pointer and keyboard; nested indentation visible; unrelated siblings stay open ([quickstart.md](./quickstart.md) §5–§6)

### Implementation for User Story 3

- [x] T017 [US3] Add `expandedIds` Signal state (Set or id map) and `toggle(id)` that adds/removes ids and clears descendant ids on collapse in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.ts`
- [x] T018 [US3] Show expand/collapse indicator only for nodes with non-empty `children`; hide children when collapsed in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.html`
- [x] T019 [US3] Bind pointer activation on expandable controls to `toggle` in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.html|ts`
- [x] T020 [US3] Make expandable controls focusable; handle Enter and Space to toggle; set `aria-expanded` reflecting state in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.html|ts` (no full arrow-key tree required)
- [x] T021 [US3] Ensure leaf nodes have no expand indicator and remain non-navigating (no `routerLink` / route table) in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.html`

**Checkpoint**: Expand/collapse + keyboard behavior meets FR-008/FR-018

---

## Phase 6: User Story 4 - Initial collapsed navigation state (Priority: P2)

**Goal**: On first authenticated load, first-level expandable groups start collapsed and visible items match the Initial Collapsed Sidebar View

**Independent Test**: Soft-refresh authenticated shell; compare visible first-level items to [spec.md](./spec.md) Initial Collapsed table and [quickstart.md](./quickstart.md) §4

### Implementation for User Story 4

- [x] T022 [US4] Initialize `expandedIds` to empty in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.ts` so all expandable nodes start collapsed (no session persistence)
- [x] T023 [US4] Manually verify / adjust first-level visibility for OPERATIONS–UTILITIES against the Initial Collapsed Sidebar View in `specs/004-erp-sidebar-nav/spec.md` using `frontend/apps/shell/src/app/layout/nav/shell-nav-menu.data.ts` + rendered output of `shell-sidebar-nav`
- [x] T024 [US4] Confirm REPORTS leaf hubs show no expand control and Supplier Reports shows one; ADMINISTRATION lists Audit Trail and System Settings as visible leaves in the rendered sidebar

**Checkpoint**: First-load collapsed state matches clarified spec

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Token consistency, scope guardrails, end-to-end quickstart validation

- [x] T025 [P] Apply minimal token-based styling (colors/spacing/typography from `@erp/ui`) in `frontend/apps/shell/src/app/layout/shell-sidebar.scss` and `shell-sidebar-nav.scss`; no new theme; icons not required
- [x] T026 [P] Confirm `/login` has no sidebar and foundation-home content-area theme/logout (if present) were not moved into the sidebar header — check `frontend/apps/shell/src/app/features/auth/login/` and `frontend/apps/shell/src/app/features/foundation-home/`
- [x] T027 Run through `specs/004-erp-sidebar-nav/quickstart.md` validation scenarios against `npx nx serve shell` and fix any gaps in `frontend/apps/shell/src/app/layout/`
- [x] T028 [P] Optional: add a focused unit test for expand/collapse toggle + descendant clearing in `frontend/apps/shell/src/app/layout/shell-sidebar-nav.spec.ts` (skip if time-boxed; not required for feature acceptance)
- [x] T029 Ensure `npx nx build shell` succeeds after layout changes

**Checkpoint**: Feature ready for review against spec + contracts

---

## Phase 8: Post-implement refinements (US5 + UX) ✅

**Purpose**: Capture shipped refinements after initial implement (documented in spec clarifications)

- [x] T030 [US5] Move layout into per-concern folders under `frontend/apps/shell/src/app/layout/` and prefer curated utilities from `frontend/libs/ui/src/styles/_utilities.scss`
- [x] T031 [US5] Add first-level Material leading icons + right-side Material expand icons (`chevron_right` / `expand_more`) in `shell-sidebar-nav` / `shell-nav-menu.data.ts`
- [x] T032 [US5] Add tree guide rails with parent-label column alignment for expanded nests in `shell-sidebar-nav.html|scss`
- [x] T033 [US5] Leaf-only selection (accent + bold); persist selected id; restore selection + ancestor expand on refresh in `shell-sidebar-nav.ts`
- [x] T034 [US5] Update Speckit artifacts (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`) to match refinements

**Checkpoint**: Speckit docs and shipped UX aligned

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP layout
- **User Story 2 (Phase 4)**: Depends on Foundational; practically follows US1 so hierarchy appears inside the scroll region
- **User Story 3 (Phase 5)**: Depends on US2 node rendering
- **User Story 4 (Phase 6)**: Depends on US3 expand state
- **Polish (Phase 7)**: Depends on US1–US4 (or at least US1–US3 for core demo)

### User Story Dependencies

- **US1 (P1)**: After Foundational — layout only; independently testable
- **US2 (P1)**: After Foundational (+ US1 recommended) — hierarchy rendering; independently reviewable once children can be shown (with US3 toggles or temporary full reveal)
- **US3 (P1)**: After US2 — expand/collapse + keyboard
- **US4 (P2)**: After US3 — initial collapsed verification

### Within Each User Story

- Prefer shell-layout composition before fine-grained nav styling (US1)
- Data accuracy before interaction polish (US2 → US3)
- Initial state last (US4)

### Parallel Opportunities

- T001 / T002 in Setup
- T015 / T016 data audits in US2
- T025 / T026 / T028 in Polish
- After Foundational, US1 can proceed while data file T004 is already done; US2–US4 are sequential on the same nav component files (limited parallel staffing on `shell-sidebar-nav.*`)

---

## Parallel Example: User Story 2

```bash
# After T012–T014 land rendering, run data audits in parallel:
Task: "Audit shell-nav-menu.data.ts labels against spec Key Entities"
Task: "Confirm clarified ADMINISTRATION / REPORTS / MASTER DATA edges in shell-nav-menu.data.ts"
```

---

## Parallel Example: Polish

```bash
Task: "Token styling pass on shell-sidebar.scss and shell-sidebar-nav.scss"
Task: "Confirm login has no sidebar; theme/logout stay out of sidebar header"
Task: "Optional shell-sidebar-nav.spec.ts toggle unit test"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Fixed brand header + independent nav scroll on authenticated shell
5. Demo layout chrome even if menu tree is still placeholder

### Incremental Delivery

1. Setup + Foundational → sidebar host + static data compile
2. US1 → full-height fixed-header scroll layout (MVP!)
3. US2 → full hierarchy under section headers
4. US3 → expand/collapse + keyboard
5. US4 → initial collapsed state sign-off
6. Polish → quickstart + build

### Parallel Team Strategy

With two developers after Foundational:

- Developer A: US1 layout (`shell-layout.*`, `shell-sidebar.*`)
- Developer B: US2 data accuracy + start `shell-sidebar-nav` rendering  
  Then serialize US3/US4 on `shell-sidebar-nav.*` to avoid merge conflicts

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- Do not add `@erp/ui` sidenav package in this feature
- Do not implement routes, permissions, route-driven active state, or mobile drawer
- First-level + expand Material icons are in scope (post-implement)
- Leave `app.routes.ts` login-outside-layout structure unchanged
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
