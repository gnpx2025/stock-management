# Contracts: Shell Sidebar Navigation

**Feature**: `004-erp-sidebar-nav` | **Date**: 2026-09-10  
**Audience**: Shell implementers and reviewers  
**Scope**: UI structure and behavior contracts (no HTTP APIs)

Updated 2026-09-15: brand moved to topbar; single sidebar component; surface + right border chrome.

---

## 1. Layout contract

| Requirement | Contract |
|-------------|----------|
| Host | Authenticated `ShellLayoutComponent` only (`/login` has no sidebar) |
| Vertical placement | Sidebar sits **under** the full-width topbar in the Shell main row |
| Height | Sidebar fills remaining height beside main content (not over the topbar) |
| Regions | Scrollable navigation only (no brand header inside sidebar) |
| Width | Use `--erp-sidebar-width` |
| Surface | Surface mix background; **right border only**; **no** box-shadow |
| Main content | Fills remaining width beside the sidebar under the topbar |
| Code layout | Single `apps/shell/src/app/layout/shell-sidebar/` component (nav merged) |

---

## 2. Brand contract (non-sidebar)

| Requirement | Contract |
|-------------|----------|
| Brand/logo + product name | Owned by topbar (005); MUST NOT appear in sidebar |
| Forbidden in sidebar | Theme toggle, logout, user menu, notifications, search, brand header |

---

## 3. Navigation structure contract

| Requirement | Contract |
|-------------|----------|
| Sections | Exactly the nine section headers in spec order |
| Section interaction | Headers are not expandable |
| Section color | Primary/accent text |
| Data source | Static typed menu matching [data-model.md](../data-model.md) |
| First-level icons | Material leading icon via `erp-icon` in accent/primary color |
| Expand indicator | Right-side Material icon; only nodes with children (`chevron_right` / `expand_more`) |
| Tree rail | Expanded groups show a vertical guide rail; child labels align with parent label column |
| Initial state (no storage) | All expandable nodes collapsed |
| Leaves | Focusable buttons; MUST NOT navigate to unimplemented pages |
| Multi-expand | Sibling groups may be expanded independently |

### Clarified nodes (must match)

- ADMINISTRATION: `Audit Trail` and `System Settings` are sibling leaves
- REPORTS: Sales/Purchase/Inventory/Finance/Customer Reports are leaves; `Supplier Reports` → `Management Reports`
- MASTER DATA: `Finance` group is sibling of `Organization`

---

## 4. Selection contract

| Requirement | Contract |
|-------------|----------|
| Selectable | Leaf nodes only |
| Expand parent | MUST NOT select the parent |
| Inactive labels | Muted text color |
| Selected leaf | Accent text + bold weight; icons remain accent |
| Persist | Selected leaf id in `localStorage` (`erp.shell.sidebar.selectedNavId`) |
| Restore | On load, restore selection and expand ancestors so the leaf is visible |
| Missing id | If stored id not in menu data, fall back to collapsed unselected state |

---

## 5. Interaction / a11y contract

| Action | Expected |
|--------|----------|
| Pointer activate expandable | Toggles expand/collapse; updates Material expand icon |
| Pointer activate leaf | Selects leaf (no navigation required) |
| Keyboard focus | Tab reaches expandable and leaf buttons |
| Enter / Space on expandable | Toggles expand/collapse |
| Enter / Space on leaf | Selects leaf |
| Arrow-key tree nav | Not required |
| `aria-expanded` | Present on expandable controls |
| `aria-current` | `page` on selected leaf |
| Collapse parent | Descendants hidden; nested expanded ids cleared |

---

## 6. Explicit non-contracts (out of scope)

- No menu HTTP API
- No permission-filtered menu
- No `routerLink` / route-driven active state (selection is local UI state)
- No mobile/off-canvas drawer behavior
- No brand header inside the sidebar (owned by 005 topbar)
- No backend changes

---

## 7. Component surface (Shell)

| Component | Path | Responsibility |
|-----------|------|----------------|
| `app-shell-layout` | `layout/shell-layout/` | Full-width topbar + main row (sidebar + body) |
| `app-shell-sidebar` | `layout/shell-sidebar/` | Aside chrome + sections/nodes; expand + selection Signals |
| `SHELL_NAV_MENU` | `layout/nav/` | Static NavSection[] |

Prefer curated `@erp/ui` utility classes for common layout. Typography inherits project-wide **Scoutie Sans** via `--erp-font-family`. Public `@erp/ui` component exports unchanged except consumption of existing `erp-icon` / tokens / utilities.
