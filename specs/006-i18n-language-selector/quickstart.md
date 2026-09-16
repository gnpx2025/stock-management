# Quickstart: Internationalization Language Selector

**Feature**: `006-i18n-language-selector` | **Date**: 2026-09-16

Validation guide for reviewers after implementation. See [contracts/i18n-language-selector-contracts.md](./contracts/i18n-language-selector-contracts.md) and [data-model.md](./data-model.md).

---

## Prerequisites

- Node modules installed under `frontend/`
- Ability to log in with existing Shell auth
- Desktop browser with working `localStorage`
- Optional: screen reader or accessibility inspector for a11y checks

---

## Run

```bash
cd frontend
npx nx serve shell
```

Optional:

```bash
cd frontend
npx nx test i18n --skip-nx-cache
npx nx test ui --skip-nx-cache
npx nx test shell --skip-nx-cache
npx nx build shell --skip-nx-cache
```

---

## Validation scenarios

### 1. Topbar placement (authenticated)

1. Sign in.
2. Inspect the right action cluster.
3. **Expect**: Order is Notification → Theme → **Language** → Profile.
4. **Expect**: Closed language control shows `🇬🇧 EN` or `🇸🇦 AR` (no full language names).

### 2. Runtime switch EN → AR

1. With English active, open the language menu.
2. **Expect**: Options `🇬🇧 EN` and `🇸🇦 AR` only (`AR`, not `ER`).
3. Choose `🇸🇦 AR`.
4. **Expect**: Sidebar + topbar chrome (and other Shell chrome strings) appear in Arabic.
5. **Expect**: Document direction RTL; sidebar on the right; topbar follows RTL.
6. **Expect**: No full application restart required.
7. **Expect**: Control remains usable and shows `🇸🇦 AR`.

### 3. Runtime switch AR → EN

1. From Arabic, choose `🇬🇧 EN`.
2. **Expect**: Shell chrome strings in English; LTR; sidebar on the left.
3. **Expect**: Selector shows `🇬🇧 EN`.

### 4. Persistence + startup restore

1. Select Arabic; note `localStorage` key `erp.language` is `ar`.
2. Full reload (or restart serve and reload).
3. **Expect**: While still on login (logged out) or after login, direction is RTL and in-scope strings follow Arabic.
4. **Expect**: After login, selector shows `🇸🇦 AR`.
5. Clear `erp.language` or set it to an invalid value; reload.
6. **Expect**: English + LTR.

### 5. Login has restore but no selector

1. Log out (or open `/login` logged out) with `erp.language=ar`.
2. **Expect**: Login copy/direction follow Arabic (or restored language).
3. **Expect**: No language selector control on the login page.

### 6. Accessibility

1. Keyboard-only: Tab to language control, open menu, choose each language in LTR and RTL.
2. **Expect**: Fully operable without a pointer.
3. Inspect accessible name.
4. **Expect**: Name is translated for the active language (not flag-only; not fixed English-only when Arabic is active).

### 7. Load-failure behavior (if testable)

1. Simulate catalog load failure for a switch (test double / forced error in unit or manual harness).
2. **Expect**: Prior language and direction remain.
3. **Expect**: Brief toast/feedback appears.
4. **Expect**: Shell stays usable.

### 8. No duplicate selectors / unchanged auth routing

1. Confirm no language selectors inside business MFE areas (none required for this feature beyond Shell).
2. Smoke login, logout, and existing navigation.
3. **Expect**: Auth and routing behavior unchanged aside from translated chrome strings.

### 9. Theme coexistence

1. Toggle theme before/after language switch.
2. **Expect**: Theme still works; language selector still appears immediately after Theme.

---

## Pass criteria

All scenarios above match [spec.md](./spec.md) success criteria SC-001–SC-010 (and SC-003a for failure). Constitution ownership: state in `@erp/i18n`, presentation in `@erp/ui`, selection UI in Shell topbar only.
