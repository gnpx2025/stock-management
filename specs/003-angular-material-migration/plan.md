# Implementation Plan: Angular Material Migration

**Branch**: `003-angular-material-migration` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-angular-material-migration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Migrate the existing Nx Angular Shell and `@erp/ui` foundation from PrimeNG to Angular Material as the sole primary UI library. Centralize Material theming and semantic color tokens in `libs/ui` (`_colors.scss`, `_tokens.scss`, `_material-theme.scss`); provide shared `erp-*` presentation components (button, spinner, icon, card, status chip) as separate `.ts`/`.html`/`.scss` files; replace login/foundation/loader/notification UI bindings; remove temporary Shell header/aside (content-only Shell) while keeping a minimal content-area logout; update UI policy gates and conflicting prior docs/specs; preserve auth, routes, federation, and loading/notification behavior. No ERP toolbar/sidebar feature and no backend changes.

## Technical Context

**Language/Version**: TypeScript (strict) on Angular ~22.1 (workspace); SCSS

**Primary Dependencies**: Nx 23; `@angular/material` (version-aligned with Angular 22); existing `@angular/cdk`; remove `primeng`, `primeicons`, `@primeng/themes`, and unused `@primeuix/themes`; Native Federation unchanged

**Storage**: N/A for this feature (no schema changes). Theme mode continues to use existing `localStorage` key via `ThemeService`.

**Testing**: Jest / `jest-preset-angular` per Nx; ESLint; `tsc`/Nx build; UI-lib gate script; smoke validation per [quickstart.md](./quickstart.md)

**Target Platform**: Existing Shell SPA (local Nx serve + production build); future MFEs consume shared theme + `erp-*` components via `@erp/ui`

**Project Type**: Frontend-only migration within existing monorepo web application (Nx + ASP.NET backend untouched)

**Performance Goals**: No new throughput targets; Shell startup and login/foundation flows remain subjectively comparable to pre-migration (functional preservation)

**Constraints**: Constitution v3.0.0 — Angular Material-first; no PrimeNG/competing UI/Tailwind; ERP shared compositions in `@erp/ui` for repeated controls; no toolbar/sidenav feature; content-only Shell; map Material theme to ERP `_colors.scss` tokens; a11y = Material defaults + keyboard/label smoke-check; update conflicting prior specs/docs

**Scale/Scope**: Shell surfaces (login, foundation home, layout loader, notifications) + `@erp/ui` theme/tokens/components + package/gate/docs cleanup; no new business MFEs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven incremental order | Pass | UI foundation migration before Shell layout feature |
| Stack: Angular/Nx/Native Federation/Material/SCSS; backend unchanged | Pass | Frontend-only; .NET/Postgres untouched |
| Angular Material primary; no PrimeNG/competing UI/Tailwind | Pass | Spec FR-006–009; gate script |
| Shared UI + centralized theme in `libs/ui`; ERP compositions for consistency | Pass | `erp-*` components + `_colors.scss` / theme bridge |
| Shell owns theme/loader/notifications; no premature full Shell layout | Pass | Content-only Shell; toolbar/sidenav deferred; minimal content logout |
| MFE boundaries / no cross-MFE UI imports | Pass | Shell → `@erp/ui` → Material |
| Signals for local UI state; no NgRx for simple shell UI | Pass | Keep `ThemeService` / `LoadingService` signals |
| Accessibility via Material capabilities | Pass | Smoke-check focus/labels |
| No backend/microservices/domain changes | Pass | Out of scope |

**Gate result**: PASS

### Post-Design Constitution Re-Check (Phase 1)

| Gate | Status | Design evidence |
|------|--------|-----------------|
| Material-first; PrimeNG removed | Pass | `research.md` §1–2, §9; contracts |
| Centralized theme + `_colors.scss` | Pass | `research.md` §3; `data-model.md` |
| Shared `erp-*` components; file-per-concern | Pass | `research.md` §4, §14–15 |
| Content-only Shell; no toolbar/sidenav | Pass | `research.md` §5; quickstart |
| Notification/loading preserved | Pass | `research.md` §6–7 |
| Docs/gates aligned to Constitution v3 | Pass | `research.md` §10 |
| Backend/federation/routing unchanged | Pass | Structure decision |

**Post-design gate result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/003-angular-material-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── prime-inventory.md
├── contracts/
│   └── frontend-ui-contracts.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── package.json
├── tools/check-no-competing-ui.js
├── apps/shell/
│   ├── src/styles.scss                   # @use colors/tokens/base/material-theme
│   └── src/app/
│       ├── layout/
│       │   ├── shell-layout.ts|html|scss # Content-only shell
│       │   └── global-loader.ts|html|scss # uses erp-spinner
│       └── features/
│           ├── auth/login/               # erp-button + MatFormField/MatInput
│           └── foundation-home/          # erp-card/button/status-chip; logout
└── libs/ui/
    ├── src/index.ts                      # Export erp-* + theme + toast + provideErpUi
    ├── src/styles/
    │   ├── _colors.scss                  # Brand + semantic CSS variables
    │   ├── _tokens.scss                  # Spacing, typography, shadow
    │   ├── _base.scss
    │   ├── _material-theme.scss
    │   └── index.scss
    └── src/lib/
        ├── components/
        │   ├── button/erp-button.ts|html|scss
        │   ├── spinner/erp-spinner.ts|html|scss
        │   ├── icon/erp-icon.ts|html|scss
        │   ├── card/erp-card.ts|html|scss
        │   └── status-chip/erp-status-chip.ts|html|scss
        ├── theme/
        │   ├── provide-erp-ui.ts
        │   └── theme.service.ts
        └── notifications/
            └── toast-notification.service.ts
```

**Structure Decision**: Existing Nx frontend only. Shared Material theme, color tokens, and `erp-*` components live in `@erp/ui`. Shell consumes `@erp/ui` for repeated presentation controls. Temporary Shell chrome is removed rather than rebuilt with MatToolbar/MatSidenav.

## Complexity Tracking

> No constitution violations requiring justification. Shared `erp-*` components are justified by ERP-specific consistency across Shell surfaces (FR-012 clarification).
