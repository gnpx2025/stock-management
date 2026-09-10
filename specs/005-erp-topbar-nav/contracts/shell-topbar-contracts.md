# Contracts: Shell Topbar Navigation

**Feature**: `005-erp-topbar-nav` | **Date**: 2026-09-10  
**Audience**: Shell implementers and reviewers  
**Scope**: UI structure and behavior contracts (no HTTP APIs)

Updated for post-implement refinements (sidenav-matched surface + bottom shadow; `erp-search-input`).

---

## 1. Layout contract

| Requirement | Contract |
|-------------|----------|
| Host | Authenticated `ShellLayoutComponent` only (`/login` has no topbar) |
| Horizontal span | Topbar in **main content column only**; MUST NOT cover/span above the sidebar |
| Vertical position | Top of content column; remains visible while page body scrolls |
| Scroll model | Shell host non-scrolling; sidebar nav may scroll independently; **one** content-body scrollbar under the topbar |
| Surface | Same surface mix as sidenav (`--erp-color-surface` mix) |
| Separation | Bottom box-shadow matching sidenav shadow style (downward); **no** bottom border |
| Height | Prefer `--erp-header-height` alignment with sidebar header |
| Code layout | `apps/shell/src/app/layout/shell-topbar/` with separated ts/html/scss |

---

## 2. Content contract

| Region | Required elements | Notes |
|--------|-------------------|-------|
| Left | Search input | `erp-search-input`; editable; UI-only |
| Right (L→R) | Notification, Theme toggle, Profile | Default order for this feature |

### Search

| Requirement | Contract |
|-------------|----------|
| Component | `@erp/ui` `erp-search-input` (custom input + autocomplete) |
| Forbidden component | MUST NOT use `erp-form-field` / Material form-field for this control |
| Editable | Yes |
| Autocomplete | Local filter of static stub options allowed |
| Execute search API / navigate | MUST NOT |
| Accessibility | `aria-label` (or equivalent) + appropriate placeholder |
| Search field background | MUST NOT apply a background fill |

### Notification

| Requirement | Contract |
|-------------|----------|
| Enabled / focusable | Yes |
| On activate | No-op (no panel, toast, menu, list, API) |
| Accessibility | Accessible name (not icon-only silence) |
| Component preference | `@erp/ui` button + icon |

### Theme toggle

| Requirement | Contract |
|-------------|----------|
| Mechanism | Existing `ThemeService` only |
| On activate | `toggle()` Light ↔ Dark |
| Affordance | Shows **next** theme (action); accessible name describes action |
| Forbidden | Second theme store / new theme architecture |
| Component preference | `@erp/ui` button + icon |

### Profile + Logout

| Requirement | Contract |
|-------------|----------|
| Display | Logged-in `userName` or fallback `User` |
| Menu | Opens on activate; contains **Logout only** |
| Logout | `AuthSessionService.logout()`; reuse existing `/login` navigation |
| Forbidden | Profile page, Settings, Change Password, new auth system |
| Accessibility | Keyboard can open menu and activate Logout |
| Menu primitive | Angular Material menu in Shell (no `@erp/ui` menu wrapper required) |

---

## 3. Integration contract

| Integration | Allowed | Forbidden |
|-------------|---------|-----------|
| Theme | Wire to `ThemeService` | New theme service/state |
| Auth logout | Wire to `AuthSessionService.logout()` | New auth architecture |
| User name | Read existing session user | User profile API |
| Search | Local UI + static stub autocomplete | Search API / global search navigation |
| Notifications | UI control only | Notification API / panel |

---

## 4. Styling contract

| Requirement | Contract |
|-------------|----------|
| Utilities | Prefer `@erp/ui` `_utilities.scss` for flex/gap/spacing/border/rounded/min-width |
| Component SCSS | Only genuinely specific rules (topbar surface/shadow; search focus/disabled/input resets) |
| Frameworks | No Tailwind or competing styling systems |
| Tokens | Reuse `--erp-header-height`, `--erp-color-surface`, `--erp-color-ink-rgb`, spacing tokens |

---

## 5. Coexistence contract

| Requirement | Contract |
|-------------|----------|
| Sidebar | Existing full-height sidebar + brand header unchanged in purpose |
| Foundation-home | Duplicate theme toggle + Logout chrome removed |
| Login | Unchanged; no topbar |
| Scope | No unrelated refactors |

---

## 6. Acceptance mapping (summary)

| Spec outcome | Contract proof |
|--------------|----------------|
| SC-001 sticky content-column | Layout contract scroll model |
| SC-002 surface + bottom shadow | Surface / separation rules |
| SC-003 elements present | Content contract |
| SC-004 theme | Theme toggle + ThemeService |
| SC-005/006/007 profile logout | Profile + Logout + a11y |
| SC-008 placeholders | Search/Notification rules |
| SC-009 sidebar intact | Coexistence |
| SC-010 accessible names | Per-control accessibility rows |

See also [data-model.md](../data-model.md) and [quickstart.md](../quickstart.md).
