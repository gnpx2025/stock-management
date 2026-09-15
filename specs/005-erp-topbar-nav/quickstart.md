# Quickstart: ERP Topbar Navigation

**Feature**: `005-erp-topbar-nav` | **Date**: 2026-09-10

Validation guide for reviewers after implementation. See [contracts/shell-topbar-contracts.md](./contracts/shell-topbar-contracts.md) and [data-model.md](./data-model.md).

Updated 2026-09-15: full-width topbar; brand on left; dark-mode icon buttons.

---

## Prerequisites

- Node modules installed under `frontend/`
- Ability to log in with existing Shell auth
- Desktop viewport with enough page content to scroll (foundation-home or tall content)

---

## Run

```bash
cd frontend
npx nx serve shell
```

Sign in to the authenticated shell.

Optional:

```bash
cd frontend
npx nx test shell --skip-nx-cache
npx nx build shell --skip-nx-cache
```

---

## Validation scenarios

### 1. Login has no topbar

1. Open `/login` while logged out.
2. **Expect**: Full-page login only — no ERP topbar.

### 2. Full-width sticky topbar + sidebar under it

1. Sign in.
2. **Expect**: Topbar spans full width with brand on the left.
3. **Expect**: Sidebar sits under the topbar (not beside a content-only topbar).
4. Scroll the main page content.
5. **Expect**: Topbar stays visible; only the content body scrolls; no extra window/second content scrollbar.
6. Scroll the sidebar menu if overflowed.
7. **Expect**: Sidebar menu still scrolls independently; topbar behavior unchanged.

### 3. Visual separation

1. Inspect the topbar.
2. **Expect**: Surface background present.
3. **Expect**: No bottom border on the topbar.
4. **Expect**: Bottom box-shadow separates topbar from content below.
5. **Expect**: Brand title uses accent/primary color.

### 4. Search placeholder (`erp-search-input`, UI-only)

1. Find search after the brand on the left of the topbar (custom pill/input — not Material form-field chrome).
2. Focus and type text.
3. **Expect**: Text is accepted; autocomplete MAY show locally filtered static stub suggestions.
4. **Expect**: No search API / network calls and no navigation from selecting stubs in this feature.
5. **Expect**: Accessible label or clear placeholder (e.g. Search); search field has no background fill.

### 5. Notification placeholder (no-op)

1. Activate the notification control.
2. **Expect**: Nothing visible opens (no panel, toast, or menu).
3. **Expect**: Control remains enabled/focusable and has an accessible name.

### 6. Theme toggle (existing mechanism)

1. Note current appearance (light or dark).
2. Activate theme toggle.
3. **Expect**: Application theme switches via existing theme behavior (`app-dark` / stored preference).
4. **Expect**: Control affordance/accessible name describes switching **to** the other theme.
5. Toggle again and confirm round-trip Light ↔ Dark.
6. **Expect**: Notification and theme icon buttons remain visible in both themes.
7. **Expect**: No duplicate theme controls remaining on foundation-home.

### 7. Profile menu + Logout

1. **Expect**: Profile control shows the session user name (or `User` fallback).
2. Open the profile menu.
3. **Expect**: Logout is present; no Profile/Settings/Change Password items required.
4. Choose Logout.
5. **Expect**: Existing logout flow runs and lands on `/login`.

### 8. Keyboard accessibility

1. Tab to profile control; open menu with keyboard; activate Logout.
2. **Expect**: Possible without a pointer.
3. Tab to notification and theme controls.
4. **Expect**: Purpose clear from accessible names without relying on icons alone.

### 9. Scope guardrails

1. Confirm no new search/notification APIs or backend endpoints were added for this feature.
2. Confirm sidebar navigation behavior from 004 still passes smoke checks (expand/scroll/selection under topbar).

---

## Done when

All scenarios above pass and contracts in [shell-topbar-contracts.md](./contracts/shell-topbar-contracts.md) are satisfied.
