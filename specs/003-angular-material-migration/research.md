# Research: Angular Material Migration

**Feature**: `003-angular-material-migration` | **Date**: 2026-09-09

All Technical Context unknowns resolved. Decisions below guide implementation and tasks.

---

## 1. Migrate in place (no greenfield rewrite)

**Decision**: Inspect and update the existing Shell + `@erp/ui` + package/gate/docs surfaces. Do not scaffold a new Nx app or recreate login/auth/core HTTP foundations.

**Rationale**: Spec FR-001; current PrimeNG usage is concentrated and enumerable.

**Alternatives considered**:
- New Shell app with Material — rejected (unnecessary risk; breaks incremental delivery).
- Dual-run PrimeNG + Material temporarily — rejected (constitution forbids competing UI libraries).

---

## 2. Dependency set

**Decision**:
- Add `@angular/material` version-aligned with workspace Angular (`~22.1.0`).
- Keep existing `@angular/cdk`.
- Remove `primeng`, `primeicons`, `@primeng/themes`.
- Remove `@primeuix/themes` if nothing else requires it after PrimeNG removal (verify before delete).
- Do not add NG-ZORRO, Bootstrap UI, Tailwind, or other competing kits.
- Prefer Angular CLI/schematics `ng add @angular/material` (or Nx-equivalent) only insofar as it installs packages and theme scaffolding that we then centralize under `@erp/ui`—do not leave per-app duplicate themes.

**Rationale**: Constitution v3.0.0; package cleanup FR-008/009.

**Alternatives considered**:
- Keep PrimeNG for toast only — rejected (complete removal required).
- Use CDK-only without Material — rejected (forms/cards/spinner/snackbar need Material).

---

## 3. Centralized Material theme mapped to ERP tokens

**Decision**:
- Author Material theme SCSS (M3/`mat.theme`) inside `libs/ui` (`src/styles/_material-theme.scss`).
- Define brand + semantic colors in `libs/ui/src/styles/_colors.scss` (`--erp-color-*` including success/warn/error/info/overlay/mist).
- Keep spacing/typography/shadow in `_tokens.scss` (which `@use`s `_colors.scss`).
- Project UI text font is **Scoutie Sans** via `--erp-font-family` (sole family); Material theme plain/brand families MUST use Scoutie Sans; Shell loads Scoutie Sans + Material Icons only for UI fonts.
- Map Material system tokens and snackbar panel classes to `--erp-*` variables (no hardcoded semantic hex in components).
- Continue dark mode via `ThemeService` toggling `app-dark` + `color-scheme` on `documentElement`.
- Shell `styles.scss` imports shared UI styles only—no independent Material theme per app.
- Theme-toggle **UI** lives on foundation home (content-area) via `ThemeService.toggle()` for verification; full branding/settings UI remains out of scope.

**Rationale**: Clarification (map to ERP tokens); FR-014–016; post-implement color-token clarification; 2026-09-10 foundation theme toggle.

**Alternatives considered**:
- Ship Material indigo/pink defaults — rejected (clarification).
- Per-MFE themes — rejected (constitution).
- Hardcode hex in component SCSS — rejected (post-implement clarification).

---

## 4. Shared UI library and ERP presentation components

**Decision**:
- `@erp/ui` owns: `provideErpUi()`, `ThemeService`, Material theme + `_colors.scss` tokens, notification handler, and shared presentation components:
  - `erp-button` (`ErpButtonComponent`)
  - `erp-spinner` (`ErpSpinnerComponent`)
  - `erp-icon` (`ErpIconComponent`)
  - `erp-card` (`ErpCardComponent`)
  - `erp-status-chip` (`ErpStatusChipComponent`)
  - `erp-form-field` (`ErpFormFieldComponent`) + `erpPrefix` / `erpSuffix`
- Each `erp-*` component MUST use separate `.ts`, `.html`, and `.scss` files.
- Shell/features import these from `@erp/ui` for repeated controls and form fields.
- `erp-form-field` owns MatFormFieldControl types in-template (`control` switch); do not project the control via `ng-content` (Material discovery limitation).
- `provideErpUi()` registers `provideNativeDateAdapter()` for date/time pickers.
- Do not create wrappers that add no ERP API, styling, or composition value.

**Rationale**: Post-implement clarifications; FR-010–013 / FR-012a / FR-017a; 2026-09-10 form-field composition.

**Alternatives considered**:
- Import Material directly everywhere — rejected (user requested shared ERP components).
- Inline templates/styles in component TS — rejected (user required three-file structure).
- Project arbitrary `matInput`/`mat-select` into wrapped `mat-form-field` — rejected (MatFormFieldControl not discovered through nested projection; bridge hacks brittle).
- Thin 1:1 wrappers for every Material primitive — rejected (no ERP value).

---

## 5. Content-only Shell layout

**Decision**:
- Remove temporary `shell__header` and `shell__sidebar` markup/styles.
- Retain: global notification path, `app-global-loader` (uses `erp-spinner`), and `<router-outlet>` content region.
- Add **Logout** and **theme toggle** via `erp-button` on foundation home—**not** MatToolbar/MatSidenav.
- Foundation home MAY include a temporary **form-field UI lab** card exercising every `erp-form-field` control type.
- Do not implement ERP navigation menu, toolbar, or sidenav.

**Rationale**: Clarifications Q1/Q4; FR-002; SC-005.

**Alternatives considered**:
- Keep custom header/aside and only swap buttons — rejected (user chose remove).
- Implement MatToolbar/MatSidenav now — rejected (explicit non-goal).

---

## 6. Notifications → MatSnackBar behind existing facade

**Decision**:
- Keep `NotificationHandler` / `NOTIFICATION_HANDLER` in `@erp/core` and `NotificationMessage` in `@erp/contracts`.
- Reimplement `ToastNotificationService` with `MatSnackBar` (duration from `lifeMs`, severity via panelClass or distinct snackbar configs).
- Remove `MessageService`, `<p-toast>`, and PrimeNG toast providers from `provideErpUi` / Shell layout.
- Preserve `success`/`info`/`warn`/`error` convenience methods used by foundation home and error interceptor path.

**Rationale**: FR-020; avoid redesigning global notification architecture.

**Alternatives considered**:
- Custom CDK Overlay toast system — rejected (MatSnackBar sufficient).
- Change `NotificationHandler` contract shape — rejected (preserve behavior/contracts).

---

## 7. Global loader → `erp-spinner`

**Decision**: Replace PrimeNG progress spinner in `GlobalLoaderComponent` with `erp-spinner` (Material spinner underneath). Keep `LoadingService` signal-driven overlay ownership. Implement `global-loader` as separate `.ts`/`.html`/`.scss`. Do not invent a new global loading architecture.

**Rationale**: FR-021; shared spinner composition.

**Alternatives considered**:
- Use `MatProgressSpinner` directly in Shell only — superseded by shared `erp-spinner`.
- Move entire loader overlay into `@erp/ui` — deferred; Shell ownership retained.

---

## 8. Component substitution map (current footprint)

**Decision**: Use the following equivalents for existing PrimeNG usage:

| Current | Replacement |
|---------|-------------|
| `p-button` / `Button` | `erp-button` (Material button variants underneath) |
| `p-password` / `Password` | `erp-form-field` + `erp-button` `erpSuffix` icon toggle |
| `InputText` | `erp-form-field` (`control="input"`) |
| `Message` (login errors) | `erp-form-field` `[error]` / inline error text using `--erp-color-error` |
| `p-card` / `Card` | `erp-card` |
| `p-tag` / `Tag` | `erp-status-chip` |
| `p-toast` / `Toast` | `MatSnackBar` via `ToastNotificationService` |
| `p-progressspinner` | `erp-spinner` |
| `pi pi-*` icons | `erp-icon` + Material Icons font |
| Form selects / dates / chips (lab) | `erp-form-field` `control` variants |

No PrimeNG tables/dialogs/menus found; FR-022 applies if discovered.

**Rationale**: Spec migration map + shared ERP components clarification.

**Alternatives considered**:
- Direct Material everywhere without `erp-*` — rejected (user requested shared components).

---

## 9. Icons strategy

**Decision**: Load Material Icons (or Material Symbols Outlined) once via shared UI/Shell styles; use `MatIconRegistry` defaults. Remove `primeicons` CSS import. Do not add Font Awesome or other icon kits.

**Rationale**: FR-017; constitution.

**Alternatives considered**:
- SVG-only custom icon set — deferred (unnecessary for current few icons).
- Keep PrimeIcons alongside Material — rejected.

---

## 10. Policy gate and documentation alignment

**Decision**:
- Rewrite `frontend/tools/check-no-competing-ui.js` to **allow** `@angular/material` / `@angular/cdk` and **forbid** `primeng`, `primeicons`, `@primeng/*`, NG-ZORRO, Bootstrap UI packages, Tailwind, etc.
- Update `docs/frontend-architecture.md` UI policy to Material-first.
- Update requirement language in `specs/001-platform-foundation` and `specs/002-login-authentication` (and related checklists/plans/research where they **mandate** PrimeNG) so current requirements align with Constitution v3.0.0. Historical narrative may note the prior choice; active “MUST use PrimeNG” statements must not remain.

**Rationale**: Clarification Q3; FR-027–028; SC-008.

**Alternatives considered**:
- Leave historical specs unchanged — rejected (user chose update).
- Supersession note only — weaker than full mandate removal; user chose updates.

---

## 11. Forms, routing, federation, backend

**Decision**: Keep reactive/signal forms and validation rules as-is; only swap control components/templates/styles. Do not redesign routes or Native Federation config. No backend/API/contract DTO changes.

**Rationale**: FR-003–004, FR-018, FR-023.

**Alternatives considered**:
- Refactor login to a new form library — rejected (out of scope).

---

## 12. Accessibility acceptance

**Decision**: Rely on Material a11y defaults; manually smoke-check login + foundation primary controls for keyboard focus order, visible focus, and accessible labels. No formal WCAG audit artifact required in this feature.

**Rationale**: Clarification Q5; FR-023.

**Alternatives considered**:
- Formal WCAG 2.2 AA checklist — deferred.
- No a11y bar — rejected (constitution + clarification).

---

## 13. Quality verification

**Decision**: After migration, run frontend lint, typecheck/build (`nx build shell`), affected unit tests, `npm run check:ui-libs`, repo search for `primeng|primeicons|@primeng|p-button|p-toast|pi pi-`, and quickstart manual scenarios. Document any pre-existing unrelated test failures.

**Rationale**: FR-024–026; SC-001–002, SC-006.

**Alternatives considered**:
- Visual regression suite — out of scope for this increment.

---

## 14. Component file structure

**Decision**: Every shared `erp-*` component (and Shell components such as `global-loader`) MUST use separate `*.ts`, `*.html`, and `*.scss` files via `templateUrl` / `styleUrl`. Do not use inline `template` or `styles` arrays for these components.

**Rationale**: Post-implement clarification; maintainability consistency with Shell feature components.

**Alternatives considered**:
- Inline templates for tiny wrappers — rejected (user required three-file structure).

---

## 15. Color token file

**Decision**: Create/maintain `frontend/libs/ui/src/styles/_colors.scss` as the single source for brand and semantic CSS custom properties. Component and feature SCSS MUST reference `var(--erp-color-*)` instead of hardcoded semantic/brand hex values. `_tokens.scss` owns spacing/typography/shadow and consumes `_colors.scss`.

**Rationale**: Post-implement clarification; FR-016.

**Alternatives considered**:
- Keep hex literals in component SCSS — rejected.
- Put colors only inside `_material-theme.scss` — rejected (need reusable tokens outside Material mapping).

---

## 16. Curated layout utilities

**Decision**:
- Maintain `frontend/libs/ui/src/styles/_utilities.scss` with a small curated set of layout helpers (`d-flex`, `d-grid`, flex alignment, `gap-*`, spacing `m-*`/`p-*`, width helpers, text color helpers).
- Wire via `styles/index.scss` and Shell `styles.scss`.
- Use utilities in Shell templates (login, foundation home, shell layout, global loader) where they replace duplicated common layout declarations.
- Keep feature SCSS for screen-specific visuals (gradients, brand mark, typography scales, complex grids).
- Do **not** add TailwindCSS or another third-party utility framework.

**Rationale**: Post-implement clarification; FR-016a; reusable styles belong in `libs/ui`.

**Alternatives considered**:
- Tailwind — rejected (constitution / FR-008).
- Duplicate `display: flex` in every feature SCSS — rejected (user requested shared classes).
- Full Bootstrap-scale utility dump — rejected (keep curated / token-backed).

---

## 17. Project typography (Scoutie Sans)

**Decision**: Sole UI text font is **Scoutie Sans**, owned by `--erp-font-family` in `libs/ui/src/styles/_tokens.scss`. Material theme `plain-family` / `brand-family` MUST be Scoutie Sans. Shell `styles.scss` loads Scoutie Sans (weights 400/600/700) plus Material Icons only. Do not ship competing UI text fonts (Source Sans, Fraunces, Roboto Slab, system UI stacks, monospace for UI copy).

**Rationale**: Clarification session 2026-09-10 (project typography); single brand typeface across Shell and `@erp/ui`.

**Alternatives considered**: Dual sans/display pair; Roboto Slab — removed in favor of Scoutie Sans.
