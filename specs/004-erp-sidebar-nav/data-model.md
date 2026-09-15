# Data Model: ERP Sidebar Navigation

**Feature**: `004-erp-sidebar-nav` | **Date**: 2026-09-10

In-memory UI model plus local selection persistence. No database or API schemas.

---

## Entities

### NavSection

Visual grouping header (non-interactive, non-expandable).

| Field | Type | Rules |
|-------|------|--------|
| `id` | string | Stable unique id (e.g. `sales`) |
| `label` | string | Display label (e.g. `SALES`) |
| `items` | NavNode[] | First-level items under the section |

**Order (required)**: OPERATIONS → SALES → PURCHASING → INVENTORY → FINANCE → MASTER DATA → REPORTS → ADMINISTRATION → UTILITIES.

### NavNode

Menu node (leaf or expandable group).

| Field | Type | Rules |
|-------|------|--------|
| `id` | string | Stable unique id across the tree (e.g. `sales.transactions`) |
| `label` | string | Display label; MUST NOT redundantly repeat parent section name |
| `icon` | string \| undefined | Material icon name; used for **first-level** items only |
| `children` | NavNode[] \| undefined | If present and non-empty → expandable; if absent/empty → leaf |

**Invariants**:
- Empty `children` arrays MUST NOT be used to imply expandability (no empty expanders).
- Section headers are **not** NavNodes.
- Leaf nodes have no children and do not require a route field in this feature.

### SidebarUiState

Presentation state for the sidebar (Shell Signal-backed).

| Field | Type | Rules |
|-------|------|--------|
| `expandedIds` | Set\<string\> | Ids of currently expanded NavNodes |
| `selectedId` | string \| null | Selected **leaf** id only |
| Initial (no storage) | `expandedIds` empty; `selectedId` null | Initial Collapsed Sidebar View |

**Transitions**:
- `toggle(id)`: expand/collapse; on collapse clear descendant expanded ids.
- `select(leafId)`: set `selectedId`; ensure ancestor ids are expanded; persist `selectedId`.
- Restore: read persisted `selectedId`; if found in tree, set selection and `expandedIds` to ancestors.

**Persistence**:
- Key: `erp.shell.sidebar.selectedNavId`
- Store: selected leaf id only (not full expand map)

### SidebarChrome

| Region | Contents | Behavior |
|--------|----------|----------|
| Navigation | Ordered NavSections + NavNodes | Independently vertically scrollable under topbar |
| Brand header | None | Brand owned by topbar (005) |
| Surface | Surface mix + right border | No box-shadow |

---

## Hierarchy snapshot (canonical)

Encoded fully in `layout/nav/shell-nav-menu.data.ts`. Summary of clarified edges:

- **OPERATIONS**: Dashboard (leaf)
- **SALES**: Transactions → …; Sales Return → Credit Note; Operations → …
- **PURCHASING**: Transactions → … (Reports under Transactions)
- **INVENTORY**: Transactions / Operations trees per spec
- **FINANCE**: Accounting / Receivables / Payables / Cash & Bank (Reports leaf under Cash & Bank)
- **MASTER DATA**: Parties, Products, Organization, Finance (sibling of Organization)
- **REPORTS**: five leaf hubs + Supplier Reports → Management Reports
- **ADMINISTRATION**: eight leaves including sibling Audit Trail and System Settings
- **UTILITIES**: four leaves

Full label lists: see [spec.md](./spec.md) Key Entities.

---

## Validation rules

1. Every expandable node has ≥1 child.
2. Section labels are headers only (no expand state).
3. `id` uniqueness across all nodes.
4. Without stored selection, `expandedIds` starts empty.
5. Only leaves may be selected.
6. No route/permission metadata required for acceptance of this feature.
