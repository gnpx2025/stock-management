# Contracts: Shell Sidebar Navigation

**Feature**: `004-erp-sidebar-nav` | **Date**: 2026-09-10  
**Audience**: Shell implementers and reviewers  
**Scope**: UI structure and behavior contracts (no HTTP APIs)

---

## 1. Layout contract

| Requirement | Contract |
|-------------|----------|
| Host | Authenticated `ShellLayoutComponent` only (`/login` has no sidebar) |
| Height | Sidebar container spans full viewport height of the shell chrome |
| Regions | (1) Fixed header (2) Scrollable navigation |
| Header scroll | Header MUST NOT translate when navigation scrolls |
| Width | Use `--erp-sidebar-width` |
| Main content | Fills remaining width beside the sidebar |
| Code layout | Per-concern folders under `apps/shell/src/app/layout/` |

---

## 2. Header contract

| Requirement | Contract |
|-------------|----------|
| Content | Brand/logo **or** product name text only |
| Forbidden | Theme toggle, logout, user menu, notifications, search |

---

## 3. Navigation structure contract

| Requirement | Contract |
|-------------|----------|
| Sections | Exactly the nine section headers in spec order |
| Section interaction | Headers are not expandable |
| Data source | Static typed menu matching [data-model.md](../data-model.md) |
| First-level icons | Material leading icon via `erp-icon` |
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
| Visual | Accent text color + bold weight only; no border / heavy background for selection or expand state |
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
- No toolbar/topbar feature
- No backend changes

---

## 7. Component surface (Shell)

| Component | Path | Responsibility |
|-----------|------|----------------|
| `app-shell-layout` | `layout/shell-layout/` | Sidebar + main content shell |
| `app-shell-sidebar` | `layout/shell-sidebar/` | Aside chrome: header + scroll host |
| `app-shell-sidebar-nav` | `layout/shell-sidebar-nav/` | Sections/nodes; expand + selection Signals |
| `SHELL_NAV_MENU` | `layout/nav/` | Static NavSection[] |

Prefer curated `@erp/ui` utility classes for common layout. Typography inherits project-wide **Scoutie Sans** via `--erp-font-family`. Public `@erp/ui` component exports unchanged except consumption of existing `erp-icon` / tokens / utilities.
