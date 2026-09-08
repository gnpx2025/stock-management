# Frontend architecture

## Stack

- Angular 21+ (workspace currently on Angular 22)
- Nx workspace
- Native Federation (`@angular-architects/native-federation`) — Shell is a **dynamic-host**
- PrimeNG + PrimeIcons as the **only** primary UI component library
- SCSS + centralized theme tokens in `@erp/ui`
- Strict TypeScript, ESLint module boundaries, Jest

## Applications

| App | Role |
|-----|------|
| `shell` | Bootstrap, layout, theme, global loader/toasts, foundation home |

Future remotes (not created yet): `master-data`, `finance`, `inventory`, `purchasing`, `sales`, `reports`. See `frontend/apps/shell/public/federation.manifest.example.json`.

## Libraries

| Path alias | Purpose |
|------------|---------|
| `@erp/core` | HTTP, config, errors, loading, auth/context placeholders |
| `@erp/ui` | Theme, toast facade, shared SCSS — PrimeNG used directly |
| `@erp/shared` | Non-UI helpers |
| `@erp/contracts` | Shared TypeScript DTOs / placeholders |

## Adding a future remote

1. Generate a new Nx Angular app.
2. Initialize Native Federation as a remote.
3. Expose routes/components in the remote federation config.
4. Register the remote URL in the Shell `federation.manifest.json`.
5. Lazy-load via `loadRemoteModule` from Shell routes.
6. Consume `@erp/core`, `@erp/ui`, `@erp/contracts` — do **not** add competing UI libraries.

## UI policy

Competing libraries (Angular Material, NG-ZORRO, Bootstrap UI, Tailwind) are forbidden. CI/local guard: `npm run check:ui-libs` in `frontend/`.
