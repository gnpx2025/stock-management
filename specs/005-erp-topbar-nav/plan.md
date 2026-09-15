# Implementation Plan: ERP Topbar Navigation

**Branch**: `005-erp-topbar-nav` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-erp-topbar-nav/spec.md`

**Note**: Updated for 2026-09-15 chrome refinements (full-width topbar; brand on left; icon-button dark mode).

## Summary

Add Shell authenticated topbar chrome spanning the **full viewport width** above sidebar + content: sticky header with brand mark + product name, left `erp-search-input` (custom input + autocomplete, UI-only stubs), right notification no-op, theme toggle wired to existing `ThemeService`, and profile menu with Logout wired to existing `AuthSessionService`. Shell layout is a column (topbar → main row of sidebar + scrollable body). Topbar surface + bottom shadow. Icon buttons remain visible in light/dark via ERP-mapped Material tokens. Remove duplicate theme/logout controls from foundation-home. No search/notification APIs, profile pages, new theme/auth architecture, or backend work.

## Technical Context

**Language/Version**: TypeScript (strict) on Angular ~22.1 (workspace); SCSS

**Primary Dependencies**: Nx 23; `@angular/material` + `@angular/cdk` (`MatMenu`, `MatAutocomplete`); `@erp/ui` (`erp-button`, `erp-icon`, `erp-search-input`, `ThemeService`, tokens/utilities); `@erp/core` (`AuthSessionService`); Signals for search query UI state

**Storage**: Theme persistence already via `ThemeService` (`localStorage` `erp.themeMode`); no new topbar persistence; no backend

**Testing**: Jest / `jest-preset-angular` for helpers if any; ESLint; Nx build/serve smoke per [quickstart.md](./quickstart.md)

**Target Platform**: Existing Shell SPA (authenticated `ShellLayoutComponent` routes only; `/login` unchanged)

**Project Type**: Frontend-only Shell layout feature within existing Nx monorepo (backend untouched)

**Performance Goals**: Topbar sticky/toggle/menu/autocomplete interactions feel instant on desktop; no layout thrash or second scrollbar

**Constraints**: Constitution — Shell owns topbar/toolbar + global theme + auth entry; Material-first via `@erp/ui` where wrapped; Signals for Shell presentation; full-width sticky topbar above sidebar; surface + bottom shadow (no bottom border); search via `erp-search-input` (not `erp-form-field`); utilities-first styling; no competing UI libraries / Tailwind; no new theme or auth systems

**Scale/Scope**: One Shell topbar + shared `erp-search-input` + shell-layout scroll restructure; brand owned by topbar; migrate theme/logout off foundation-home

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven incremental order | Pass | Sidebar (004) delivered; Shell topbar chrome |
| Stack: Angular/Nx/Material/SCSS; backend unchanged | Pass | Frontend-only |
| Angular Material primary; no competing UI/Tailwind | Pass | `erp-button` / `erp-icon` / `erp-search-input`; `MatMenu` / autocomplete direct |
| Shared UI + centralized theme in `libs/ui` | Pass | `ThemeService` + `erp-search-input`; no second theme system |
| Shell owns topbar / toolbar / theme / auth entry | Pass | `layout/shell-topbar/` |
| Signals for Shell presentation state | Pass | Search query Signals; theme/auth existing services |
| Accessibility via Material capabilities | Pass | Labels; keyboard MatMenu + Logout |
| MFE boundaries | Pass | Shell chrome + shared UI lib |
| No backend / search-notification / profile-page creep | Pass | Stub autocomplete only; logout/theme only |

**Gate result**: PASS

### Post-Design / Post-Implement Constitution Re-Check

| Gate | Status | Design evidence |
|------|--------|-----------------|
| Shell owns topbar | Pass | research §1; `layout/shell-topbar/` |
| Content-column sticky without second scrollbar | Superseded | Full-width topbar; sidebar under topbar; still one content scrollbar |
| Full-width sticky without second scrollbar | Pass | research §2; contracts layout |
| Reuse ThemeService / AuthSessionService | Pass | research §3–§4 |
| Material-first; shared search in `libs/ui` | Pass | research §5 / §11 |
| Surface + bottom shadow | Pass | research §7 |
| Placeholders non-API | Pass | research §8; FR-006/007 |
| Remove duplicate foundation-home chrome | Pass | research §9 |
| Brand on topbar; icon dark-mode tokens | Pass | research §2 / §13 |

**Post-design gate result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/005-erp-topbar-nav/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── shell-topbar-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── apps/shell/src/app/
│   ├── layout/
│   │   ├── shell-layout/shell-layout.ts|html|scss
│   │   ├── shell-topbar/shell-topbar.ts|html|scss
│   │   ├── shell-sidebar/
│   │   ├── global-loader/
│   │   └── nav/
│   └── features/
│       └── foundation-home/   # theme/logout chrome removed
└── libs/
    ├── ui/
    │   ├── lib/components/search-input/erp-search-input.ts|html|scss
    │   ├── lib/components/button/erp-button.ts|html|scss
    │   ├── styles/_utilities.scss
    │   ├── styles/_material-theme.scss
    │   └── … ThemeService, erp-icon, tokens
    └── core/        # AuthSessionService (logout + user)
```

**Structure Decision**: `layout/shell-topbar/` for Shell chrome; reusable search lives in `@erp/ui` as `erp-search-input`. Prefer curated utilities for common layout/border/spacing; keep surface/shadow/brand and search focus/disabled resets in component SCSS. Shell layout is topbar-first column, then sidebar + body row.

## Complexity Tracking

> No constitution violations requiring justification.
