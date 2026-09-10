# Data Model: Angular Material Migration

**Feature**: `003-angular-material-migration` | **Date**: 2026-09-09

This feature does not introduce backend persistence entities. The “model” is the shared frontend design-system and UI facade shapes that must remain stable across the migration.

---

## DesignSystemTheme

Logical configuration owned by `@erp/ui`.

| Field / concern | Description | Rules |
|-----------------|-------------|-------|
| Brand + semantic colors | `--erp-color-*` in `_colors.scss` (bg, surface, border, text, muted, accent, accent-contrast, success, warn, error, info, overlay, mist, etc.) | Single source of brand/semantic truth; components MUST use tokens, not hardcoded hex |
| Typography | `--erp-font-family: 'Scoutie Sans'` in `_tokens.scss` | Sole project UI text font; Material `plain-family` / `brand-family` MUST match; no competing UI text fonts |
| Spacing | `--erp-space-*` | Preserved for layout SCSS |
| Elevation / shadow | `--erp-shadow-soft` | Preserved |
| Density | Material density setting (default comfortable unless tokens imply otherwise) | Single shared setting |
| Light / dark | Driven by `ThemeMode` + `app-dark` class + `color-scheme` | Light default; OS prefer on first visit; persisted `erp.themeMode`; foundation-home content toggle for verification |
| Material bridge | `_material-theme.scss` maps Material system tokens / snackbar panels to `--erp-*` | No per-MFE overrides |
| Form-field filled fill | `--mat-form-field-filled-container-color` = 10% accent via `--erp-color-accent-rgb` on `erp-form-field` host | Tokenized; no hardcoded hex |

**Relationships**: Consumed by Shell styles and all future MFEs via `@erp/ui` style entrypoints. `ThemeService` applies dark class; does not own color values.

**Validation**: Exactly one centralized theme definition; `_colors.scss` is the color token file; no duplicate Material theme files under `apps/*`.

---

## ThemeMode (existing contract)

Already defined in `@erp/contracts` as `'light' | 'dark'`.

| Transition | Trigger | Notes |
|------------|---------|-------|
| → light / → dark | `ThemeService.setMode` / `toggle` | Foundation-home content toggle; API remains for future Shell chrome |
| Initial resolve | storage → OS prefer → light | Unchanged |

---

## NotificationMessage (existing contract)

Existing shape used by `NotificationHandler`:

| Field | Meaning |
|-------|---------|
| `severity` | `success` \| `info` \| `warn` \| `error` |
| `summary` | Short title |
| `detail` | Optional body |
| `lifeMs` | Optional duration (default ~4000) |

**Migration rule**: Same fields; MatSnackBar adapter must honor severity and duration. No breaking contract changes.

---

## NotificationFacade

| Component | Role |
|-----------|------|
| `NotificationHandler` (`@erp/core`) | Injection contract |
| `ToastNotificationService` (`@erp/ui`) | MatSnackBar implementation |
| Callers | Error interceptor path, foundation demo, auth feedback as today |

**State**: Stateless show API; no persistent notification store in this feature.

---

## GlobalLoadingFoundation

| Component | Role |
|-----------|------|
| `LoadingService` (`@erp/core`) | Signal / ref-count style loading flag |
| `GlobalLoaderComponent` (Shell) | Overlay + `erp-spinner`; separate `.ts`/`.html`/`.scss` |
| HTTP loading interceptor | Existing request-driven behavior preserved |

**State transitions**: idle ↔ loading based on existing service semantics (unchanged).

---

## ShellChrome (post-migration)

| Element | State after migration |
|---------|----------------------|
| Temporary header | **Removed** |
| Temporary aside nav | **Removed** |
| Content outlet | **Retained** |
| Global loader | **Retained** (`erp-spinner`) |
| Notification path | **Retained** (MatSnackBar) |
| Logout control | **Moved** to foundation-home content via `erp-button` |
| Theme toggle | **Content-area** on foundation home via `ThemeService.toggle()` |
| Form-field UI lab | **Temporary** foundation-home card exercising all `erp-form-field` controls |

No new entities for toolbar/sidenav navigation trees.

---

## SharedUiFoundation

| Asset | Location | Rule |
|-------|----------|------|
| Theme providers | `provideErpUi()` | Material providers + native date adapter; no PrimeNG |
| Theme service | `ThemeService` | Keep |
| Notification service | `ToastNotificationService` | MatSnackBar |
| Color tokens | `libs/ui/src/styles/_colors.scss` | Brand + semantic CSS variables |
| Spacing/typography | `libs/ui/src/styles/_tokens.scss` | Consumes `_colors.scss` |
| Layout utilities | `libs/ui/src/styles/_utilities.scss` | Curated helpers (`d-flex`, `gap-*`, …); not Tailwind |
| Material bridge | `libs/ui/src/styles/_material-theme.scss` | Maps Material → ERP tokens |
| `erp-button` | `libs/ui/.../components/button/` | Separate `.ts`/`.html`/`.scss` |
| `erp-spinner` | `libs/ui/.../components/spinner/` | Separate `.ts`/`.html`/`.scss` |
| `erp-icon` | `libs/ui/.../components/icon/` | Separate `.ts`/`.html`/`.scss` |
| `erp-card` | `libs/ui/.../components/card/` | Separate `.ts`/`.html`/`.scss` |
| `erp-status-chip` | `libs/ui/.../components/status-chip/` | Separate `.ts`/`.html`/`.scss` |
| `erp-form-field` | `libs/ui/.../components/form-field/` | All MatFormFieldControl types; prefix/suffix markers |

**Consumption rule**: Shell/features use `erp-*` for repeated presentation and form fields (login + foundation lab).

---

## Out of scope entities

- ERP navigation menu model, toolbar actions model, sidenav tree
- New auth/session fields
- Backend tables or DTOs
