---
name: erp-frontend
description: >-
  Angular/Nx frontend implementation standards for the ERP Shell and shared
  libs. Use when building or changing frontend features, UI components,
  styling, auth client, i18n, routing, or state. Prescribes @erp/* usage,
  Material policy, Signals, and folder conventions.
---

# ERP Frontend Standards

Read `.cursor/skills/erp-architecture/SKILL.md` first. Follow the constitution
UI and state sections.

## Stack (fixed)

- Angular **22**, standalone components only (no NgModules)
- Nx path aliases: `@erp/contracts`, `@erp/shared`, `@erp/core`, `@erp/ui`, `@erp/i18n`
- Angular Material + CDK only; ban competing UI libs (`npm run check:ui-libs`)
- SCSS with tokens from `libs/ui/src/styles/`
- Jest + jest-preset-angular
- Native Federation host in Shell (remotes not created yet)

## Angular patterns (MUST)

- Standalone components with `ChangeDetectionStrategy.OnPush`
- Prefer `inject()` over constructor DI
- Prefer `input()` / `output()` / `signal()` / `computed()` over legacy `@Input`/`@Output` and BehaviorSubjects for UI state
- Templates use `@if` / `@for` / `@switch` (not `*ngIf` / `*ngFor`)
- Functional `HttpInterceptorFn` and `CanActivateFn`
- Reactive forms (`FormBuilder`) for forms today — do not introduce a second forms stack casually
- Co-locate `*.ts` / `*.html` / `*.scss` per component

## Library responsibilities

| Lib | Do | Do not |
|-----|----|--------|
| `@erp/contracts` | Export types/interfaces only | Import Angular / UI / HTTP |
| `@erp/shared` | Pure helpers (`isNonEmptyString`, `assertNever`) | UI, HTTP, domain services |
| `@erp/core` | Auth session, interceptors, guards, config, loading, health API client, app context | Feature templates, Material components |
| `@erp/ui` | `erp-*` wrappers, theme, toast facade, shared SCSS | Feature business logic, i18n catalogs |
| `@erp/i18n` | Catalogs, `LanguageService`, `TranslatePipe`, `provideErpI18n` | Shell layout ownership |

## UI component rules

1. Prefer an existing `@erp/ui` component when one fits.
2. Current shared components: `erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip`, `erp-form-field` (+ prefix/suffix), `erp-search-input`, `erp-menu`, `erp-language-selector`.
3. Create a new `libs/ui` wrapper only when Material alone is insufficient **or** ERP-specific reuse/composition is needed across features.
4. Shell/feature templates SHOULD import from `@erp/ui`, not deep Material modules, when a wrapper exists.
5. Selector prefix: Shell `app-`, UI `erp-`.
6. Export new public UI APIs from `libs/ui/src/index.ts`.

## Styling rules

- Global tokens: `libs/ui/src/styles/_colors.scss`, `_tokens.scss`, `_material-theme.scss`, `_base.scss`, `_utilities.scss`
- Shell entry: `apps/shell/src/styles.scss` (via `stylePreprocessorOptions.includePaths`)
- Use CSS variables `--erp-color-*` / token vars — avoid hardcoded brand colors in features
- Prefer semantic component SCSS; use curated utilities for simple layout only
- Theme via `ThemeService` (`html.app-dark`); do not invent a second theme system
- Do **not** add Tailwind or another utility CSS framework

## State management

| Concern | Pattern |
|---------|---------|
| Local UI | Component `signal` / `computed` |
| Auth | `AuthSessionService` signals |
| Theme | `ThemeService` |
| Language | `LanguageService` |
| Loading | `LoadingService` + `loadingInterceptor` |
| App context | `AppContextService` (placeholder until org context feature) |

- RxJS for HTTP and async pipelines
- **Do not** add NgRx for Shell presentation state

## Auth client

- Use `@erp/core` APIs only (`AuthSessionService`, `AuthApiService`, `authGuard`, `guestGuard`, interceptors)
- Access token stays in memory; refresh uses cookie + `withCredentials`
- Bootstrap: `loadAppConfig('/config.json')` → `provideErpCore` → `provideErpUi` → `provideErpI18n`
- Do not store JWTs in `localStorage`

## HTTP

Interceptors (order in `provideErpCore`): correlation ID → credentials → auth → loading → error notification.

- Opt out headers: `X-Skip-Loading`, `X-Skip-Error-Notification`
- API clients belong in `@erp/core` (or a future domain lib), not in feature components
- Base path: `/api/v1/...` using `APP_CONFIG.apiBaseUrl`

## i18n

- Add user-facing strings to `libs/i18n/src/lib/catalogs/en.ts` **and** `ar.ts`
- Use `TranslatePipe` (`erpTranslate`) or `LanguageService.t()`
- Keep `erp-language-selector` presentational; Shell wires `languageChange` → `setLanguage`
- `@erp/ui` MUST NOT import `@erp/i18n`

## Routing / Shell

- Routes in `apps/shell/src/app/app.routes.ts`
- Protected chrome under `ShellLayoutComponent` + `authGuard`
- Login under `guestGuard`
- Prefer `loadComponent` / remote federation when adding large features; do not dump business UI into layout components
- Nav data: `layout/nav/`; translate via catalog keys (`shell.nav.*`)

## Testing

- Colocate `*.spec.ts` next to the unit under test
- Cover pure helpers, services, and critical UI behavior
- No e2e harness yet — do not invent Playwright/Cypress without an explicit feature decision

## Anti-patterns

- Importing PrimeNG / Bootstrap / Tailwind / NG-ZORRO
- Putting business rules in templates or layout components
- Duplicating toast/loading/auth logic outside `@erp/core` / `@erp/ui`
- Creating wrappers that only re-export Material with no ERP value
- Adding `environment.ts` files — use runtime `config.json` + `APP_CONFIG`
