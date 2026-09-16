# Implementation Plan: Internationalization Language Selector

**Branch**: `006-i18n-language-selector` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-i18n-language-selector/spec.md`

**Note**: Clarifications 2026-09-16 — Shell chrome translation surface; load-failure keeps prior language + toast; browser/device-local persistence; app-wide restore including login; selector authenticated-topbar-only; accessible name translated.

## Summary

Establish shared runtime i18n (English / Arabic) in a new `libs/i18n` library: Signals-based language state, `localStorage` persistence (`en`/`ar`), document `lang`/`dir`, and Shell chrome translation catalogs. Add a compact MatMenu language selector in the Shell topbar immediately after Theme (presentation in `@erp/ui`). Translate Shell chrome (topbar, sidebar nav labels, login strings). RTL/LTR flips chrome via document direction without separate EN/AR components. No business-module catalogs, no NgRx, no PrimeNG, no topbar/sidebar redesign, no backend.

## Technical Context

**Language/Version**: TypeScript (strict) on Angular ~22.1 (workspace); SCSS

**Primary Dependencies**: Nx 23; `@angular/material` + `@angular/cdk` (`MatMenu`); `@erp/ui` (presentation selector + toast); new `@erp/i18n` (language state, catalogs, direction); `@erp/contracts` (language types); Signals (no NgRx); no ngx-translate / build-time-only `@angular/localize` runtime switch

**Storage**: Browser `localStorage` key `erp.language` (`en` | `ar`), mirroring `ThemeService` / `erp.themeMode`; no backend preference API

**Testing**: Jest / `jest-preset-angular` for `@erp/i18n` LanguageService + selector presentation; Shell smoke via [quickstart.md](./quickstart.md); ESLint; Nx build/serve

**Target Platform**: Existing Shell SPA (authenticated topbar selector; language/direction restore on login + authenticated Shell)

**Project Type**: Frontend-only shared library + Shell chrome integration within existing Nx monorepo (backend untouched)

**Performance Goals**: Language switch updates Shell chrome strings + direction in under 2s perceived time (SC-003); no full app restart

**Constraints**: Constitution — Shell owns language selection UI; `libs/i18n` owns state/translations/direction; presentation in `libs/ui`; Material-first; Signals; no competing UI libraries; no NgRx for language; authenticated selector only; device-local persistence; keep prior language + toast on catalog load failure; no topbar/sidebar layout redesign; no business MFE translation catalogs

**Scale/Scope**: New `libs/i18n`; `erp-language-selector` in `@erp/ui`; Shell topbar + sidebar nav + login string wiring; document direction; federation-ready shared singleton for future MFEs (no per-MFE selectors)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven incremental order | Pass | Topbar (005) delivered; i18n selector integrates into existing chrome |
| Stack: Angular/Nx/Material/SCSS; backend unchanged | Pass | Frontend-only |
| Angular Material primary; no competing UI/PrimeNG/Tailwind | Pass | MatMenu for compact selector; no PrimeNG |
| Shared libraries ownership | Pass | State → `libs/i18n`; presentation → `libs/ui`; types → `libs/contracts` |
| Shell owns global chrome / language selection UI | Pass | Selector in Shell topbar only |
| Signals for Shell/shared presentation state; no NgRx for simple state | Pass | LanguageService Signals; no NgRx |
| Accessibility via Material capabilities | Pass | Keyboard MatMenu; translated accessible name; flag+code |
| MFE boundaries | Pass | Shared `@erp/i18n` singleton; no per-MFE selectors |
| No backend / auth / theme / layout creep | Pass | Spec FR-019–020 |

**Gate result**: PASS

### Post-Design Constitution Re-Check

| Gate | Status | Design evidence |
|------|--------|-----------------|
| `libs/i18n` owns language/direction/persistence | Pass | research §1–§3; data-model; contracts |
| Presentation-only selector in `libs/ui` | Pass | research §5; no ui→i18n dependency |
| Material MatMenu; no PrimeNG | Pass | research §5 |
| Signals; no NgRx | Pass | research §2 |
| Shell topbar placement after Theme | Pass | research §6; contracts |
| Device-local persistence | Pass | research §3 |
| App-wide restore; selector auth-only | Pass | research §7 |
| Load failure: keep prior + toast | Pass | research §8 |
| Shell chrome translations; no MFE catalogs | Pass | research §4 |
| RTL via document direction; one component | Pass | research §9 |

**Post-design gate result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/006-i18n-language-selector/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── i18n-language-selector-contracts.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
frontend/
├── apps/shell/src/app/
│   ├── app.config.ts                    # provideErpI18n()
│   ├── layout/
│   │   ├── shell-topbar/                # wire erp-language-selector after Theme
│   │   ├── shell-sidebar/               # translate nav labels / a11y strings
│   │   └── nav/shell-nav-menu.data.ts   # label keys → resolve via i18n
│   └── features/auth/login/             # translate login copy; no selector
├── libs/
│   ├── i18n/                            # NEW @erp/i18n
│   │   └── src/lib/
│   │       ├── language.service.ts
│   │       ├── provide-erp-i18n.ts
│   │       ├── translate.pipe.ts        # or signal helper
│   │       └── catalogs/en.json|ar.json # Shell chrome catalogs
│   ├── ui/
│   │   └── lib/components/language-selector/  # erp-language-selector (presentation)
│   └── contracts/
│       └── lib/language.ts              # AppLanguage, LanguageOption types
└── tsconfig.base.json                   # @erp/i18n path
```

**Structure Decision**: New Nx library `@erp/i18n` for language state, catalogs, and direction (mirrors ThemeService ownership pattern but in its own lib per spec). Compact `erp-language-selector` in `@erp/ui` as presentation-only Inputs/Outputs (Shell binds `LanguageService`). Shell owns topbar integration and chrome string consumers (sidebar, login). No topbar/sidebar layout redesign.

## Complexity Tracking

> No constitution violations requiring justification.
