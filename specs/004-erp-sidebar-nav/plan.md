# Implementation Plan: ERP Sidebar Navigation

**Branch**: `004-erp-sidebar-nav` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-erp-sidebar-nav/spec.md`

**Note**: Updated for 2026-09-15 chrome refinements (brand in topbar; single sidebar component; surface + right border).

## Summary

Restore Shell authenticated chrome with a left sidebar under the full-width topbar: independently scrollable navigation menu, non-expandable accent section headers, and a static expandable menu hierarchy. First-level Material leading icons (accent); right-side Material expand icons; tree guide rails with label-column alignment; leaf-only selection (muted inactive labels; accent + bold when selected) persisted across refresh with ancestor expand restore. Single `shell-sidebar/` component (nav merged); surface background + right border (no shadow); `@erp/ui` tokens/utilities; project typography is **Scoutie Sans** (`--erp-font-family`); no page routes, permissions, menu APIs, or mobile drawer.

## Technical Context

**Language/Version**: TypeScript (strict) on Angular ~22.1 (workspace); SCSS

**Primary Dependencies**: Nx 23; `@angular/material` + `@angular/cdk`; `@erp/ui` (`erp-icon`, tokens, `_utilities.scss`); Shell layout components; Signals for expand + selection UI state

**Storage**: Static in-memory menu model; selected leaf id in `localStorage` (`erp.shell.sidebar.selectedNavId`); expand path restored from ancestors of selected leaf; no backend

**Testing**: Jest / `jest-preset-angular` for nav helpers; ESLint; Nx build/serve smoke per [quickstart.md](./quickstart.md)

**Target Platform**: Existing Shell SPA (authenticated `ShellLayoutComponent` routes only; `/login` unchanged)

**Project Type**: Frontend-only Shell layout feature within existing Nx monorepo (backend untouched)

**Performance Goals**: Sidebar render and expand/collapse feel instant on desktop; full static hierarchy remains smooth to scroll and toggle

**Constraints**: Constitution — Shell owns sidenav/global nav; Material-first; Signals for sidebar UI state; no competing UI libraries; no route wiring / permissions / APIs / responsive drawer / new theme; brand owned by topbar; keyboard focus + Enter/Space for expand/collapse

**Scale/Scope**: One Shell sidebar component + static nav tree covering 9 sections; per-concern folders under `layout/` (no separate `shell-sidebar-nav/`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven incremental order | Pass | UI foundation (003) complete; Shell sidenav delivered |
| Stack: Angular/Nx/Material/SCSS; backend unchanged | Pass | Frontend-only |
| Angular Material primary; no competing UI/Tailwind | Pass | Material icons via `erp-icon`; curated utilities only |
| Shared UI + centralized theme in `libs/ui` | Pass | Tokens + utilities + `erp-icon`; no `erp-sidenav` package |
| Shell owns sidenav / global navigation | Pass | Under `apps/shell/.../layout/` |
| Signals for Shell presentation state | Pass | `expandedIds` + `selectedId` Signals |
| Accessibility via Material capabilities | Pass | Focusable toggles; Enter/Space; `aria-expanded` |
| MFE boundaries | Pass | Shell-only chrome |
| No backend / permissions / route feature creep | Pass | Leaves non-navigating placeholders |

**Gate result**: PASS

### Post-Design Constitution Re-Check (Phase 1 + post-implement)

| Gate | Status | Design evidence |
|------|--------|-----------------|
| Shell owns sidenav | Pass | `layout/shell-sidebar*`, `layout/nav/` |
| Material-first; no competing UI | Pass | `erp-icon`; research §3/§8/§11 |
| Signals for expand + selection | Pass | research §4; data-model |
| Brand-only header; no toolbar | Superseded | Brand moved to full-width topbar (005); sidebar has no brand header |
| Keyboard Enter/Space | Pass | research §6 |
| Static menu; selection persistence only | Pass | research §4/§7 |
| Tokenized styling + utilities | Pass | research §8 |
| Single sidebar component | Pass | `layout/shell-sidebar/` owns nav |

**Post-design gate result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/004-erp-sidebar-nav/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── shell-sidebar-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── apps/shell/src/app/
│   ├── app.routes.ts
│   ├── layout/
│   │   ├── shell-layout/shell-layout.ts|html|scss
│   │   ├── shell-sidebar/shell-sidebar.ts|html|scss|spec.ts
│   │   ├── shell-topbar/shell-topbar.ts|html|scss
│   │   ├── global-loader/global-loader.ts|html|scss
│   │   └── nav/
│   │       ├── shell-nav.types.ts
│   │       └── shell-nav-menu.data.ts
│   └── features/
│       ├── auth/login/
│       └── foundation-home/
└── libs/ui/src/styles/
    ├── _tokens.scss
    └── _utilities.scss
```

**Structure Decision**: One folder per layout concern. Static menu under `layout/nav/`. Prefer curated utilities for flex/spacing/text helpers; keep tree-rail and selection semantics in component SCSS. Nav tree lives inside `shell-sidebar/` (no separate `shell-sidebar-nav/`).

## Complexity Tracking

> No constitution violations requiring justification.
