# Quickstart: Angular Material Migration Validation

**Feature**: `003-angular-material-migration`  
**Date**: 2026-09-09

Use this guide to prove the migration end-to-end. Implementation steps belong in `tasks.md`; this file is validation-only.

Related: [spec.md](./spec.md), [research.md](./research.md), [contracts/frontend-ui-contracts.md](./contracts/frontend-ui-contracts.md), [data-model.md](./data-model.md)

---

## 1. Prerequisites

- Node/npm toolchain already used for this repo’s frontend
- Backend + Postgres available if validating login against real API (same as feature `002`)
- Working tree on branch `003-angular-material-migration` after implementation

---

## 2. Install and static gates

From `frontend/`:

```bash
npm install
npm run check:ui-libs
```

**Expected**:
- `check:ui-libs` passes with Material/CDK allowed and PrimeNG forbidden
- `frontend/package.json` has `@angular/material` and does **not** list `primeng`, `primeicons`, or `@primeng/themes`
- `frontend/libs/ui/src/styles/_colors.scss` exists and defines `--erp-color-*`
- `frontend/libs/ui/src/styles/_utilities.scss` exists and is imported by Shell styles
- Shared `erp-*` components exist under `frontend/libs/ui/src/lib/components/` with separate `.ts`/`.html`/`.scss` each

Search residual PrimeNG usage:

```bash
# from repo root — expect no matches under frontend apps/libs (docs/specs historical notes OK if outside runtime)
rg -n "primeng|primeicons|@primeng|p-button|p-toast|p-card|p-password|pi pi-" frontend/apps frontend/libs frontend/tools || true
```

**Expected**: no runtime/source hits (script comments in `check-no-competing-ui.js` may mention forbidden names).

---

## 3. Lint, type-check, build, tests

From `frontend/` (adjust Nx targets to match workspace scripts):

```bash
npx nx lint shell
npx nx lint ui
npx nx lint core
npx nx build shell
npx nx test core --skip-nx-cache
# run other affected project tests as applicable
```

**Expected**: lint/type-check/build succeed; tests pass or failures documented as pre-existing unrelated.

---

## 4. Manual UI scenarios

Start API (if needed) and Shell per existing README/docs, then verify:

### 4.1 Content-only Shell

1. Authenticate (or use existing session).
2. Confirm **no** temporary header brand bar and **no** aside nav chrome.
3. Confirm foundation home (or default authenticated route) still renders in the content area.
4. Confirm **no** new ERP toolbar/sidenav feature.

### 4.2 Login preserved

1. Log out if needed, open login route.
2. Submit empty/invalid credentials → same validation/error feedback behavior.
3. Submit valid credentials → authenticated landing works.
4. Keyboard: Tab through fields/buttons; focus visible; inputs labeled.
5. Confirm login actions use `erp-button` and fields use `erp-form-field` (password suffix via `erpSuffix`).

### 4.3 Foundation home + logout + theme

1. View runtime configuration and platform health (`erp-status-chip` + refresh still work).
2. Demo global loader → overlay + `erp-spinner` appears then clears.
3. Demo notification → snackbar/toast-equivalent appears with success styling.
4. Use **content-area Logout** (`erp-button`) → session ends; login accessible again.
5. Use **content-area theme toggle** beside logout → light/dark switches (`.app-dark`).
6. Confirm cards/actions use `erp-card` / `erp-button` rather than duplicated Material markup.
7. Open **Form field controls (UI lab)** → exercise each `erp-form-field` `control` type; confirm JSON dump updates.

### 4.4 Theme foundation

1. Confirm shared theme styles load (ERP accent/typography from `_colors.scss` / `_tokens.scss`, not stock Material indigo).
2. Confirm filled form-field background uses ~10% accent (`--mat-form-field-filled-container-color`).
3. Toggle theme from foundation home and confirm Material + ERP tokens update together.

### 4.5 Routes

1. Direct-navigate to previously implemented Shell routes (login, foundation home, etc.).
2. Confirm routes remain reachable without the removed aside links.

### 4.6 Shared UI structure spot-check

1. Open any `erp-*` component under `frontend/libs/ui/src/lib/components/`.
2. Confirm separate `.ts` / `.html` / `.scss` files.
3. Confirm component SCSS uses `var(--erp-color-*)` (no hardcoded semantic/brand hex for tokenized colors).
4. Confirm login/foundation/shell-layout/global-loader templates use shared utilities (e.g. `d-flex`, `d-grid`, `gap-*`) for common layout.
5. Confirm `_utilities.scss` is imported via Shell `styles.scss` / `@erp/ui` styles index.

---

## 5. Docs / prior-spec spot-check

Confirm requirement language no longer **mandates** PrimeNG in:

- `docs/frontend-architecture.md`
- `specs/001-platform-foundation/spec.md` (and plan/research where they state current UI MUST be PrimeNG)
- `specs/002-login-authentication` artifacts that mandate PrimeNG controls

Historical “formerly PrimeNG” narrative is OK; active MUST-use-PrimeNG requirements are not.

Confirm Spec Kit feature docs describe `erp-*` components (including `erp-form-field`), three-file structure, `_colors.scss`, and `_utilities.scss` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `tasks.md`).

---

## 6. Acceptance mapping

| Check | Spec criteria |
|-------|----------------|
| Packages removed / Material present | SC-001, FR-006–009 |
| No PrimeNG source usage | SC-002 |
| Login + foundation + loader + notification + logout + theme toggle | SC-003 |
| Routes reachable | SC-004 |
| No header/aside; no new toolbar/sidenav | SC-005 |
| Lint/build/tests | SC-006 |
| Centralized ERP-mapped theme + gate + `erp-*` | SC-007 |
| Prior docs/specs updated | SC-008 |
| Keyboard focus/labels smoke-check | SC-009 |
| `erp-*` three-file + `--erp-color-*` tokens | SC-010 |
| Curated `_utilities.scss` used on Shell surfaces | SC-011 |
| `erp-form-field` on login + UI lab covers all control types | SC-012 |
