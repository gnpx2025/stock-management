# Frontend architecture

## Stack

- Angular 22 (constitution requires Angular 21+)
- Nx workspace
- Native Federation (`@angular-architects/native-federation`) — Shell is a **dynamic-host**
- Angular Material (+ Angular CDK) as the **only** primary UI component library
- SCSS + centralized theme tokens / Material theme bridge in `@erp/ui`
- Custom i18n in `@erp/i18n` (EN/AR + RTL)
- Strict TypeScript preference, ESLint module boundaries, Jest

## Applications

| App | Role |
|-----|------|
| `shell` | Bootstrap, authenticated layout (sidebar + topbar), global loader/toasts, login, foundation home |

Future remotes (not created yet): `master-data`, `finance`, `inventory`, `purchasing`, `sales`, `reports`. See `frontend/apps/shell/public/federation.manifest.example.json`.

## Libraries

| Path alias | Tags | Purpose |
|------------|------|---------|
| `@erp/contracts` | `type:contracts` | Shared TypeScript DTOs / interfaces only (no Angular) |
| `@erp/shared` | `type:shared` | Pure non-UI helpers |
| `@erp/core` | `type:core` | HTTP, config, errors, loading, auth/session, app context |
| `@erp/ui` | `type:ui` | Theme, Material theme bridge, toast facade, shared SCSS, reusable `erp-*` components |
| `@erp/i18n` | `type:i18n` | Language service, catalogs, `TranslatePipe`, `provideErpI18n` |

### Dependency direction (enforced by ESLint)

```text
apps (shell) → core | ui | i18n | shared | contracts
ui           → core | shared | contracts
i18n         → core | shared | contracts
core         → shared | contracts
shared       → contracts
contracts    → (none)
```

`ui` MUST NOT depend on `i18n`. Language UI components stay presentational; Shell wires them to `LanguageService`.

## Shell layout

Authenticated chrome lives under `apps/shell/src/app/layout/`:

- `shell-layout` — sidenav host + content outlet
- `shell-sidebar` — hierarchical nav
- `shell-topbar` — sticky toolbar (theme, language, logout, search placeholder)
- `global-loader` — application-level loading overlay

Feature pages live under `apps/shell/src/app/features/` (e.g. `auth/login`, `foundation-home`).

## Adding a future remote

1. Generate a new Nx Angular app.
2. Initialize Native Federation as a remote.
3. Expose routes/components in the remote federation config.
4. Register the remote URL in the Shell `federation.manifest.json`.
5. Lazy-load via `loadRemoteModule` from Shell routes.
6. Consume `@erp/core`, `@erp/ui`, `@erp/i18n`, `@erp/contracts` — use shared `erp-*` components from `@erp/ui` for repeated presentation controls; do **not** add competing UI libraries.

## UI policy

Angular Material is the approved primary UI library. Competing libraries (PrimeNG, NG-ZORRO, Bootstrap UI, Tailwind, Material UI for React) are forbidden. CI/local guard: `npm run check:ui-libs` in `frontend/`.

Reusable presentation controls live in `@erp/ui` (each with separate `.ts`/`.html`/`.scss`):

- `erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip`
- `erp-form-field` (+ `erpPrefix` / `erpSuffix`)
- `erp-search-input`, `erp-menu`, `erp-language-selector`

Features SHOULD consume these instead of duplicating Material markup. Prefer `@erp/ui` wrappers when they exist. Do not create wrappers that add no ERP-specific API, styling, or composition value.

Brand and semantic colors live in `libs/ui/src/styles/_colors.scss` (`--erp-color-*`); component SCSS MUST use those tokens.

Curated layout helper classes (`d-flex`, `gap-*`, `m-*`/`p-*`, etc.) live in `libs/ui/src/styles/_utilities.scss`. Prefer semantic feature SCSS for screen structure; use utilities for common one-off layout. Do not add Tailwind or another utility CSS framework.

## State management

- Signals for component / Shell presentation state
- Injectable services with signal APIs for auth, theme, language, loading, app context
- RxJS for HTTP and async streams
- Do **not** introduce NgRx for simple Shell UI state

## Auth (frontend)

- Access JWT in memory only (`MemoryTokenStorage`)
- Refresh via HttpOnly cookie + `withCredentials`
- Functional interceptors and guards from `@erp/core`
- Session restore on bootstrap via `provideErpCore`

See [authentication.md](authentication.md).
