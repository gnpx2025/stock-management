# Frontend UI Contracts — Angular Material Migration

**Feature**: `003-angular-material-migration`  
Type: shared UI / theme / notification contracts for Shell and future MFEs.

This feature does **not** change backend OpenAPI. Auth DTOs remain as in `002-login-authentication`.

---

## 1. `provideErpUi()` environment providers

**Owner**: `@erp/ui`  
**Consumed by**: Shell bootstrap (and future MFEs that need theme/notifications).

**Must provide**:
- Angular Material theming / animations prerequisites required for Material components used by Shell and `erp-*` compositions
- `provideNativeDateAdapter()` (or equivalent) so `erp-form-field` datepicker / date-range / timepicker work
- `ThemeService` availability (existing `providedIn: 'root'` may remain)
- `ToastNotificationService` bound to `NOTIFICATION_HANDLER`
- **Must not** provide `providePrimeNG`, PrimeNG `MessageService`, or Aura/`@primeng/themes` presets

**Contract**: Calling `provideErpUi()` once at application bootstrap is sufficient for centralized theme + notification + date adapter wiring.

---

## 2. ThemeService API (unchanged surface)

```ts
class ThemeService {
  readonly currentMode: Signal<ThemeMode>; // 'light' | 'dark'
  toggle(): void;
  setMode(mode: ThemeMode): void;
}
```

**Side effects**:
- Persists to `localStorage` key `erp.themeMode`
- Toggles CSS class `app-dark` on `document.documentElement`
- Sets `color-scheme` consistently with mode

**UI contract**: Foundation home exposes a minimal content-area theme toggle for verification; full settings/branding UI remains out of scope.

---

## 3. NotificationHandler (unchanged)

```ts
interface NotificationHandler {
  show(message: NotificationMessage): void;
}

const NOTIFICATION_HANDLER: InjectionToken<NotificationHandler>;
```

`NotificationMessage` (from `@erp/contracts`) remains the wire shape between core interceptors/features and UI.

**Implementation contract** (`ToastNotificationService`):
- Map severities to distinct snackbar presentations (panel classes or equivalent using `--erp-color-*`)
- Honor `lifeMs` (default 4000 when omitted)
- Expose convenience methods `success` / `info` / `warn` / `error` used by existing Shell code

---

## 4. Loading overlay contract (behavioral)

| Input | Output |
|-------|--------|
| `LoadingService.isLoading() === true` | Full-viewport overlay with `erp-spinner`, `role="status"`, polite live region |
| `isLoading() === false` | Overlay not shown |

Implementation uses shared `erp-spinner`; behavior and ownership stay in Shell + `@erp/core`. `GlobalLoaderComponent` MUST use separate `.ts`/`.html`/`.scss`.

---

## 5. Content-only Shell layout contract

Authenticated Shell layout **must** expose:
1. Global notification capability (via Material snackbar / facade)
2. Global loader host
3. Primary content `router-outlet`

Authenticated Shell layout **must not** expose (this feature):
- ERP toolbar/topbar
- ERP sidenav/sidebar navigation
- Temporary pre-migration header/aside chrome

**Logout + theme controls (foundation home)**:
- Visible on foundation home (or equivalent authenticated content route)
- Logout invokes existing logout use-case/service
- Theme toggle calls `ThemeService.toggle()`
- Implemented with `erp-button`; not MatToolbar/MatSidenav

---

## 6. Component usage policy (dependency direction)

```text
apps/shell (and future MFEs)
        ↓
   @erp/ui   (erp-* components, theme, _colors/_tokens, notification adapter)
        ↓
 @angular/material + @angular/cdk
```

- Repeated presentation controls (button, spinner, icon, card, status chip, form field): import `erp-*` from `@erp/ui`.
- Form fields: use `erp-form-field` (do not duplicate `mat-form-field` chrome in features).
- Theme / tokens / notification facade: import from `@erp/ui` public API only.
- Forbidden: PrimeNG imports; cross-MFE deep imports; Tailwind/utility UI frameworks.
- Do not create wrappers that add no ERP-specific API, styling, or composition value.

---

## 7. Shared `erp-*` component contract

Each shared presentation component MUST:
- Live under `frontend/libs/ui/src/lib/components/<name>/`
- Use separate `*.ts`, `*.html`, and `*.scss` files (`templateUrl` / `styleUrl`)
- Reference `--erp-color-*` (and other `--erp-*` tokens) instead of hardcoded semantic/brand hex
- Be exported from `frontend/libs/ui/src/index.ts`

| Selector | Purpose |
|----------|---------|
| `erp-button` | Primary/secondary/outline/icon button variants |
| `erp-spinner` | Indeterminate progress spinner |
| `erp-icon` | Material Icons font wrapper |
| `erp-card` | Surface card container |
| `erp-status-chip` | Status / health chip |
| `erp-form-field` | Material form-field composition (all MatFormFieldControl types) |
| `[erpPrefix]` / `[erpSuffix]` | Form-field adornment markers |

---

## 8. `erp-form-field` API contract

**Control discriminator** (`control` input):

| Value | Material control | Notes |
|-------|------------------|-------|
| `input` (default) | `input[matInput]` | `type`, `autocomplete`, `disabledInteractive` |
| `textarea` | `textarea[matInput]` | `rows` |
| `select` | `mat-select` | `options` / `optionGroups`; selection outputs |
| `native-select` | `select[matNativeControl]` | `options` |
| `datepicker` | `input` + `mat-datepicker` | toggle suffix; `min`/`max`/`dateFilter` |
| `date-range` | `mat-date-range-input` | `startControlName` + `endControlName` |
| `timepicker` | `input` + `mat-timepicker` | toggle suffix |
| `autocomplete` | `input` + `mat-autocomplete` | `options`, `displayWith` |
| `chip-grid` | `mat-chip-grid` | `string[]` FormControl; chip add/remove |

**Shared inputs**: `label`, `hint`, `error`, `appearance`, `controlName`, `placeholder`, `required`, `readonly`, `disabled` (synced via FormControl API).

**Adornments**: Project with `erpPrefix` / `erpSuffix` (wrapped to Material prefix/suffix slots).

**Implementation constraints**:
- Controls are rendered **in-template** (not projected as MatFormFieldControl) so Material can discover them.
- Do not bind `[disabled]` alongside `formControlName`; use `disabled` input → `FormControl.disable()` / `enable()`.

**Density / filled color** (component SCSS on host):
- `--erp-form-field-*` spacing vars
- `--mat-form-field-filled-container-color: rgb(var(--erp-color-accent-rgb) / 0.1)`

---

## 9. Color token contract

| File | Owns |
|------|------|
| `libs/ui/src/styles/_colors.scss` | Brand + semantic CSS custom properties (`--erp-color-*`, including `--erp-color-accent-rgb`) |
| `libs/ui/src/styles/_tokens.scss` | Spacing, typography, shadow (consumes `_colors.scss`) |
| `libs/ui/src/styles/_utilities.scss` | Curated layout/spacing/text helper classes (`d-flex`, `gap-*`, `m-*`/`p-*`, `text-muted`, …) |
| `libs/ui/src/styles/_material-theme.scss` | Material theme bridge mapped to ERP tokens |

Component and feature SCSS MUST use `var(--erp-color-*)` when a token exists.

**Utility usage contract**:
- Shell/MFE templates SHOULD apply utilities for common layout instead of redeclaring the same rules in feature SCSS.
- Feature SCSS remains for screen-specific visuals (gradients, brand treatments, complex grids).
- MUST NOT introduce TailwindCSS or another third-party utility CSS framework.

---

## 10. UI library policy gate

`frontend/tools/check-no-competing-ui.js` (invoked via `npm run check:ui-libs`):

| Package pattern | Policy |
|-----------------|--------|
| `@angular/material`, `@angular/cdk` | Allowed |
| `primeng`, `primeicons`, `@primeng/*`, `@primeicons/*` | Forbidden |
| `ng-zorro-antd`, Bootstrap UI packages, `tailwindcss`, `@tailwindcss/*` | Forbidden |

Gate failure = non-zero exit (CI/local).

---

## 11. Public `@erp/ui` exports (minimum)

Must export (names may stay stable):
- `provideErpUi`
- `ThemeService` / `DARK_MODE_CLASS`
- `ToastNotificationService`
- `ErpButtonComponent` / `erp-button`
- `ErpSpinnerComponent` / `erp-spinner`
- `ErpIconComponent` / `erp-icon`
- `ErpCardComponent` / `erp-card`
- `ErpStatusChipComponent` / `erp-status-chip`
- `ErpFormFieldComponent` / `erp-form-field`
- `ErpPrefixDirective` / `erpPrefix`
- `ErpSuffixDirective` / `erpSuffix`
- Types: `ErpFormFieldControl`, `ErpFormFieldOption`, `ErpFormFieldOptionGroup`

Additional Material theme SCSS is consumed via style imports, not necessarily TS exports.

---

## 12. Explicit non-contracts

- No new REST endpoints
- No changes to login request/response DTOs
- No federation remote manifest contract changes
- No ERP navigation menu schema
- Foundation form-field UI lab is temporary QA chrome, not a product settings contract
