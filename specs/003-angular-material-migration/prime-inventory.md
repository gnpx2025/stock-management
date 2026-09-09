# PrimeNG inventory (pre-migration)

**Feature**: `003-angular-material-migration`  
**Date**: 2026-09-09

| File | PrimeNG / related usage | Final target (post-implement) |
|------|-------------------------|-------------------------------|
| `frontend/package.json` | `primeng`, `primeicons`, `@primeng/themes`, `@primeuix/themes` | `@angular/material` (+ existing CDK) |
| `frontend/tools/check-no-competing-ui.js` | Allows PrimeNG; forbids Material | Allow Material/CDK; forbid PrimeNG + competitors |
| `frontend/libs/ui/src/lib/theme/provide-erp-ui.ts` | `providePrimeNG`, Aura, `MessageService` | Material providers + snackbar facade |
| `frontend/libs/ui/src/lib/notifications/toast-notification.service.ts` | `MessageService` | `MatSnackBar` |
| `frontend/libs/ui/src/styles/` | PrimeNG theme CSS | `_colors.scss`, `_tokens.scss`, `_material-theme.scss` |
| `frontend/apps/shell/src/styles.scss` | `primeicons` CSS | Material Icons font + `@erp/ui` theme |
| `frontend/apps/shell/src/app/layout/shell-layout.ts\|html` | `Toast`, `Button`, header/aside | Content-only; snackbar (no host); remove chrome |
| `frontend/apps/shell/src/app/layout/global-loader.*` | `ProgressSpinner` | `erp-spinner` (three-file component) |
| `frontend/apps/shell/src/app/features/auth/login/*` | `Button`, `InputText`, `Password`, `Message`, `.p-password` | `erp-button` + `MatFormField`/`MatInput` + error text |
| `frontend/apps/shell/src/app/features/foundation-home/*` | `Card`, `Tag`, `Button`, `pi pi-refresh` | `erp-card`, `erp-status-chip`, `erp-button`, `erp-icon` + logout |

**Shared `@erp/ui` components added (post-migration refinement):**

| Component | Path |
|-----------|------|
| `erp-button` | `frontend/libs/ui/src/lib/components/button/` |
| `erp-spinner` | `frontend/libs/ui/src/lib/components/spinner/` |
| `erp-icon` | `frontend/libs/ui/src/lib/components/icon/` |
| `erp-card` | `frontend/libs/ui/src/lib/components/card/` |
| `erp-status-chip` | `frontend/libs/ui/src/lib/components/status-chip/` |

No PrimeNG tables, dialogs, or menus found.
