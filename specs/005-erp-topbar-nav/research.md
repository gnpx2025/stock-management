# Research: ERP Topbar Navigation

**Feature**: `005-erp-topbar-nav` | **Date**: 2026-09-10

All Technical Context unknowns resolved against the current Shell, `@erp/ui`, and `@erp/core` codebases. Updated for post-implement refinements (surface/shadow chrome, `erp-search-input`, utilities-first search styling).

---

## 1. Ownership and file placement

**Decision**: Implement under `frontend/apps/shell/src/app/layout/shell-topbar/` with separated `shell-topbar.ts`, `shell-topbar.html`, and `shell-topbar.scss` (same naming style as `shell-sidebar/`). Selector `app-shell-topbar`. Do not create an `erp-toolbar` package in `@erp/ui` for this feature.

**Rationale**: Constitution Shell ownership of topbar; single consumer; matches 004 folder-per-concern convention (FR-017).

**Alternatives considered**:
- Flat files under `layout/` — rejected (inconsistent with sidebar).
- Shared `@erp/ui` toolbar — deferred (YAGNI; one Shell consumer).

---

## 2. Sticky layout and scroll container

**Decision**: Keep full-height sidebar beside a content column. Restructure the content column from a single scrolling `<main>` into a vertical flex column:

1. Sticky/fixed-height topbar (non-scrolling)
2. Scrollable content body that owns `overflow-auto` and page padding (`p-6` moves from outer main onto the body)

Host remains `100dvh` / `overflow: hidden` so the window does not scroll. Only one content scrollbar (the body under the topbar). Sidebar nav continues to scroll independently.

**Rationale**: Spec requires content-column-only sticky topbar without a second scrollbar (clarification Q1; FR-001–003).

**Alternatives considered**:
- `position: sticky` inside current scrolling `<main>` — fragile with padding/overflow; rejected.
- Full-viewport-width toolbar above sidebar — rejected by clarification.
- `MatToolbar` as scroll host — unnecessary; semantic header + flex is enough.

---

## 3. Theme toggle integration

**Decision**: Inject existing `@erp/ui` `ThemeService`. Call `toggle()` on click. Bind icon/label/aria from `currentMode()` with **action affordance**:

- Dark mode active → show `light_mode` / “Switch to light theme”
- Light mode active → show `dark_mode` / “Switch to dark theme”

Do not add a second theme store or duplicate persistence (`erp.themeMode` already handled).

**Rationale**: FR-008–010; clarification Q4; service already exists and matches UX.

**Alternatives considered**: New Shell-local theme signal — rejected (duplicate architecture). Status-affordance icons — rejected by clarification.

---

## 4. Profile display name and logout

**Decision**: Use `@erp/core` `AuthSessionService`:

- Display: `user()?.userName` with fallback `"User"` when empty/null
- Logout: `logout().subscribe()` — existing implementation clears session and navigates to `/login` (including when API logout fails)

Profile trigger opens Material `MatMenu` with a single Logout item. No Profile/Settings/Change Password items.

**Rationale**: FR-011–014; no user API; reuse post-logout redirect.

**Alternatives considered**: New AuthService wrapper — rejected. Custom dropdown without MatMenu — rejected (worse a11y; Material is approved).

---

## 5. UI component choices (`@erp/ui` + Material)

**Decision**:

| Control | Implementation |
|---------|----------------|
| Search | Dedicated `@erp/ui` `erp-search-input`: custom styled input (no `erp-form-field` / `MatFormField`) + Material autocomplete; static stub options; local filter only |
| Notification | `erp-button` `variant="icon"` + `notifications` icon; enabled; click handler no-op; `ariaLabel` “Notifications” |
| Theme | `erp-button` `variant="icon"` wired to `ThemeService` |
| Profile | Material outlined button showing user name; `MatMenu` + Logout `mat-menu-item` |
| Icons | `erp-icon` / `erp-button` `icon` input (Material ligatures) |

No `@erp/ui` menu/toolbar wrappers — use Material `MatMenu` directly in Shell.

**Rationale**: Post-implement refinement; FR-016; constitution allows Material direct use and reusable ERP search composition in `libs/ui`.

**Alternatives considered**:
- `erp-form-field` + FormGroup — rejected post-implement (user: customize input; no form-field).
- Raw MatInput only in Shell without shared component — weaker reuse.
- Disabled notification button / empty notification panel — rejected by clarification.

---

## 6. Right-side control order

**Decision**: Left → search. Right cluster left-to-right: **Notification → Theme → Profile**.

**Rationale**: Spec order of description; profile as trailing action is common ERP chrome.

**Alternatives considered**: Theme before notification — acceptable alternate; stick to one default.

---

## 7. Visual separation and sizing

**Decision** (post-implement refinement; supersedes earlier border-only / no-fill clarification):

- Topbar background matches sidenav: `color-mix(in srgb, var(--erp-color-surface) 96%, transparent)`
- No bottom border
- Bottom box-shadow matching sidenav shadow style, directed downward: `0 4px 12px rgb(var(--erp-color-ink-rgb) / …)`
- Height aligned with `--erp-header-height` (3.5rem)
- Prefer curated `@erp/ui` utilities for flex/gap/spacing; topbar-specific surface/shadow in `shell-topbar.scss`

**Rationale**: User post-implement request for visual parity with sidenav chrome.

**Alternatives considered**: Border-only / no fill (earlier clarification) — superseded. Full Material elevation system — unnecessary.

---

## 8. Placeholder behaviors

**Decision**:

- Search: editable, focusable, accessible label/placeholder; `erp-search-input` autocomplete with static stub options and local filter; no search API / navigation
- Notification: enabled, focusable; activate does nothing visible

**Rationale**: Clarifications Q2/Q5 + post-implement search component decision; FR-006/007; SC-008.

**Alternatives considered**: Disabled controls — rejected. Empty options with no autocomplete affordance — rejected post-implement.

---

## 9. Foundation-home chrome cleanup

**Decision**: Remove temporary theme toggle and Logout button (and related “until toolbar lands” copy) from `foundation-home`. Keep unrelated demos. Theme mode may remain as diagnostic text in the runtime card.

**Rationale**: Avoid duplicate controls once topbar owns theme/logout.

**Alternatives considered**: Leave duplicates — rejected.

---

## 10. Accessibility

**Decision**:

- Icon-only buttons: required `aria-label`
- Search: `aria-label` + placeholder on `erp-search-input`
- Theme: accessible name describes switch action from current mode
- Profile menu: keyboard open + focusable Logout via MatMenu defaults

**Rationale**: FR-015; SC-007/SC-010.

---

## 11. Search input styling (utilities-first)

**Decision**: Prefer curated `_utilities.scss` classes on `erp-search-input` (`d-flex`, `gap-*`, `px-*`, `border`, `rounded-pill`, `min-w-0`, `border-0`, `outline-none`, `bg-transparent`, etc.). No search-field background fill. Component SCSS limited to focus ring, disabled state, icon size, and input text/placeholder/webkit resets. Extend utilities only when generally reusable (e.g. `min-w-0`, `border`, `rounded-pill`).

**Rationale**: Post-implement user request; FR-018; keep utilities curated.

**Alternatives considered**: Heavy BEM-only SCSS for layout — rejected. Adding Tailwind — forbidden.

---

## 12. Out of scope (confirmed)

No search API, notification API/panel, profile pages, additional profile actions, new theme/auth architecture, backend/DB/API endpoints, mobile topbar redesign, or unrelated refactors.
