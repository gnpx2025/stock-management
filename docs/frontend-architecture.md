# Frontend architecture

## Stack

- Angular 21+ (workspace currently on Angular 22)
- Nx workspace
- Native Federation (`@angular-architects/native-federation`) — Shell is a **dynamic-host**
- Angular Material (+ Angular CDK) as the **only** primary UI component library
- SCSS + centralized theme tokens / Material theme bridge in `@erp/ui`
- Strict TypeScript, ESLint module boundaries, Jest

## Applications

| App | Role |
|-----|------|
| `shell` | Bootstrap, content shell, theme foundation, global loader/snackbars, foundation home, login |

Future remotes (not created yet): `master-data`, `finance`, `inventory`, `purchasing`, `sales`, `reports`. See `frontend/apps/shell/public/federation.manifest.example.json`.

## Libraries

| Path alias | Purpose |
|------------|---------|
| `@erp/core` | HTTP, config, errors, loading, auth/session |
| `@erp/ui` | Theme, Material theme bridge, snackbar notification facade, shared SCSS, reusable ERP components (`erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip`) |
| `@erp/shared` | Non-UI helpers |
| `@erp/contracts` | Shared TypeScript DTOs / placeholders |

## Adding a future remote

1. Generate a new Nx Angular app.
2. Initialize Native Federation as a remote.
3. Expose routes/components in the remote federation config.
4. Register the remote URL in the Shell `federation.manifest.json`.
5. Lazy-load via `loadRemoteModule` from Shell routes.
6. Consume `@erp/core`, `@erp/ui`, `@erp/contracts` — use shared `erp-*` components from `@erp/ui` for repeated presentation controls; do **not** add competing UI libraries.

## UI policy

Angular Material is the approved primary UI library. Competing libraries (PrimeNG, NG-ZORRO, Bootstrap UI, Tailwind, Material UI for React) are forbidden. CI/local guard: `npm run check:ui-libs` in `frontend/`.

Reusable presentation controls live in `@erp/ui` as `erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, and `erp-status-chip` (each with separate `.ts`/`.html`/`.scss`). Features SHOULD consume these instead of duplicating Material markup. One-off form primitives (e.g. `mat-form-field` / `matInput`) MAY use Material directly until a shared form composition exists. Do not create wrappers that add no ERP-specific API, styling, or composition value.

Brand and semantic colors live in `libs/ui/src/styles/_colors.scss` (`--erp-color-*`); component SCSS MUST use those tokens.

Curated layout helper classes (`d-flex`, `gap-*`, `m-*`/`p-*`, etc.) live in `libs/ui/src/styles/_utilities.scss`. Prefer semantic feature SCSS for screen structure; use utilities for common one-off layout. Do not add Tailwind or another utility CSS framework.

ERP toolbar/sidenav/navigation chrome is owned by Shell but delivered in a later feature; this foundation uses a content-only authenticated shell.
