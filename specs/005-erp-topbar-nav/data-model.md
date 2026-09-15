# Data Model: ERP Topbar Navigation

**Feature**: `005-erp-topbar-nav` | **Date**: 2026-09-10

Presentation / session-display model only. No database or new API schemas. Theme and auth entities are owned by existing shared services. Updated 2026-09-15 for full-width topbar + brand.

---

## Entities

### TopbarChrome

Layout region spanning the **full Shell width** above sidebar + content.

| Region | Contents | Behavior |
|--------|----------|----------|
| Left | Brand, then Search (`erp-search-input`) | Brand fixed; search editable UI-only |
| Right | Notification, Theme toggle, Profile | See controls below |
| Surface | Surface mix | Visual chrome |
| Separation | Bottom box-shadow | No bottom border |
| Scroll | Non-scrolling chrome | Page body below scrolls |

**Invariants**:
- Topbar spans full shell width.
- Height aligns with `--erp-header-height` unless a documented exception is needed.
- Must not introduce a second application scrollbar.
- Sidebar sits under the topbar (not beside a content-only topbar).

### Brand

| Field | Type | Rules |
|-------|------|--------|
| Mark | string | Short mark text (e.g. `ERP`) |
| Title | string | Product name (e.g. `ERP Platform`) |
| Color | token | Accent/primary for mark + title |

### SearchPlaceholder / ErpSearchOption

| Field | Type | Rules |
|-------|------|--------|
| `query` | string | Local UI state only; may be empty |
| `placeholder` / `ariaLabel` | string | Accessible name required (e.g. “Search”) |
| `options` | `{ value: string; label: string }[]` | Static stubs for autocomplete UI |
| Filter | local | Client-side label/value contains match |
| Behavior | — | MUST NOT call search APIs or navigate |

### NotificationPlaceholder

| Field | Type | Rules |
|-------|------|--------|
| Enabled | boolean | Always true in this feature |
| Activate | — | No-op (no panel, toast, menu, data, API) |
| Accessible name | string | Required (e.g. “Notifications”) |

### ThemeToggleControl

Reflects existing theme preference; does not own persistence.

| Field | Source | Rules |
|-------|--------|--------|
| `currentMode` | `ThemeService.currentMode()` | `'light' \| 'dark'` |
| Action affordance | Derived | Icon/label/name describe the **next** theme |
| Activate | `ThemeService.toggle()` | Switches Light ↔ Dark via existing mechanism |

**Transitions**:
- Light → activate → Dark; affordance updates to “switch to light”
- Dark → activate → Light; affordance updates to “switch to dark”

### SessionUserDisplay

| Field | Source | Rules |
|-------|--------|--------|
| `displayName` | `AuthSessionService.user()?.userName` | Fallback `"User"` if missing/empty |
| API | — | No user profile API in this feature |

### ProfileMenu

| Field | Type | Rules |
|-------|------|--------|
| Open | boolean | Opened from profile control |
| Actions | Logout only | No Profile / Settings / Change Password |

### LogoutAction

| Field | Source | Rules |
|-------|--------|--------|
| Invoke | `AuthSessionService.logout()` | Reuse existing clear + `/login` navigation |
| Error UX | Existing service behavior | No new auth error UI |

---

## Relationships

```text
ShellLayout
  ├── TopbarChrome (full width)
  │     ├── Brand
  │     ├── erp-search-input → SearchPlaceholder + ErpSearchOption[]
  │     ├── NotificationPlaceholder
  │     ├── ThemeToggleControl → ThemeService (existing)
  │     └── ProfileMenu → SessionUserDisplay + LogoutAction → AuthSessionService
  └── Main row
        ├── ShellSidebar (under topbar; existing 004)
        └── Scrollable page body → router-outlet
```

---

## Persistence

| Concern | Store | Owner |
|---------|-------|--------|
| Theme mode | `localStorage` `erp.themeMode` | Existing `ThemeService` |
| Topbar search text / options | None required | Ephemeral component state + static stubs |
| Notification | None | N/A |
| Profile menu open | Ephemeral | Component / MatMenu |

No new persistence keys for this feature.
