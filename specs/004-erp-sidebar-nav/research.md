# Research: ERP Sidebar Navigation

**Feature**: `004-erp-sidebar-nav` | **Date**: 2026-09-10

All Technical Context unknowns resolved. Updated for post-implement refinements.

---

## 1. Ownership and file placement (Shell-local folders)

**Decision**: Implement under `frontend/apps/shell/src/app/layout/` with one folder per concern:

- `shell-layout/`
- `shell-sidebar/` (owns chrome + nav tree; single component)
- `shell-topbar/` (brand + chrome; feature 005)
- `global-loader/`
- `nav/` (`shell-nav.types.ts`, `shell-nav-menu.data.ts`)

Do not introduce `erp-sidenav` in `@erp/ui` for this feature. Do not keep a separate `shell-sidebar-nav/` folder (merged 2026-09-15).

**Rationale**: Constitution Shell ownership; single consumer; clearer maintenance than flat layout files; single sidebar component reduces indirection.

**Alternatives considered**:
- Flat files directly under `layout/` — replaced by folder-per-concern after implement feedback.
- Separate `shell-sidebar-nav/` — merged into `shell-sidebar/` (2026-09-15).
- `@erp/ui` shared sidenav — deferred (YAGNI).

---

## 2. Layout primitive: CSS flex aside vs `MatSidenav`

**Decision**: Semantic `<aside>` under the full-width topbar in a flex Shell main row, width `--erp-sidebar-width`. No `MatSidenav` drawer modes. Sidebar fills remaining height beside content; host remains `100dvh` / `overflow: hidden`.

**Rationale**: Permanent desktop sidebar; mobile drawer out of scope; brand/topbar owned above.

**Alternatives considered**: `MatSidenav mode="side"` — heavier, unnecessary. Full-viewport-height sidebar with brand header — superseded 2026-09-15.

---

## 3. Expandable tree UI: nested list + Signals + tree rail

**Decision**: Recursive template for nodes; Signals for `expandedIds` and `selectedId`. Expand control is Material `erp-icon` on the **right** (`chevron_right` / `expand_more`). Expanded children render inside a branch with a vertical **rail** under the parent icon (deeper nests use a deep-branch rail). Child labels align to the parent label column via fixed lead icon width + branch padding.

**Rationale**: Matches post-implement UX reference; clearer than CSS-only chevrons and ad-hoc padding.

**Alternatives considered**:
- MatTree — rejected.
- CSS border-left on nested `ul` only — insufficient alignment control; replaced by explicit rail + branch list.
- CSS triangle chevron — replaced by Material icons.

---

## 4. Expand / selection lifecycle

**Decision**:
- Default (no stored selection): `expandedIds` empty (Initial Collapsed Sidebar View).
- Toggle expands/collapses; collapsing clears descendant expanded ids; siblings independent.
- Only **leaves** can be selected; toggling a parent does **not** select it.
- Persist selected leaf id in `localStorage` key `erp.shell.sidebar.selectedNavId`.
- On load: if stored id exists in menu data, set selection and expand ancestor ids so the leaf is visible.
- Do not persist the full expand map independently.

**Rationale**: Post-implement clarifications; refresh continuity without implying routing.

**Alternatives considered**:
- Persist all expanded ids — unnecessary if ancestors derive from selection.
- Select parents on expand — rejected (user: highlight selected leaf only).

---

## 5. Brand / header content

**Decision** (2026-09-15): Brand mark + product name live in the **topbar**, not the sidebar. Sidebar has no brand header region. Theme/logout remain topbar actions (005).

**Rationale**: User chrome refinement; earlier brand-in-sidebar clarification superseded.

**Alternatives considered**: Fixed brand header inside sidebar — shipped initially, then moved to topbar.

---

## 6. Keyboard accessibility

**Decision**: Expandable and leaf controls are buttons (focusable); Enter/Space activate. `aria-expanded` on expandables; `aria-current="page"` on selected leaf. No full arrow-key tree nav.

**Rationale**: Clarification Q3 / FR-018.

---

## 7. Menu data source and leaf behavior

**Decision**: Typed static `SHELL_NAV_MENU` with optional `icon` on first-level nodes. Leaves do not navigate. No permissions/API.

**Rationale**: FR-012–015, FR-019.

---

## 8. Styling, tokens, and utilities

**Decision**:
- Tokens for sidebar width, colors, spacing.
- Prefer curated `_utilities.scss` classes (`d-flex`, `gap-*`, `p-*`, `text-muted`, `fw-*`, `overflow-auto`, etc.) in templates.
- Component SCSS owns tree rail, lead column, selection text emphasis, surface + right border (no shadow).
- Section headers and leading icons: accent/primary.
- Inactive item labels: muted; selected leaf labels: accent + bold; icons stay accent.
- Selection: accent color + `font-weight: 600` only — **no** border or heavy background for expand/selection states.
- First-level leading icons + expand icons via `erp-icon`.
- Typography inherits project-wide **Scoutie Sans** from `--erp-font-family` (no local competing text fonts).

**Rationale**: Post-implement UX; constitution token/utility guidance.

**Alternatives considered**:
- Heavy bordered “button” rows — rejected by user.
- Background highlight for selection — toned down to text-only emphasis.
- Roboto Slab / prior display+sans pairs — replaced by Scoutie Sans project-wide.

---

## 9. Shell layout composition

**Decision**: `shell-layout` = sidebar | scrollable main. Login outside layout.

**Rationale**: Authenticated chrome only.

---

## 10. Hierarchy clarifications baked into data

**Decision**: Same clarified edges as before (Admin siblings; REPORTS leaves + Supplier Reports child; MASTER DATA Finance sibling; Purchasing Reports under Transactions; etc.).

---

## 11. Icons

**Decision**: Material Icons font already loaded for Shell. First-level `icon` field names Material glyphs. Expand uses `chevron_right` / `expand_more`.

**Rationale**: Post-implement request; aligns with Material-first stack.

---

## 12. Project typography (Scoutie Sans)

**Decision**: Sole UI text font is **Scoutie Sans** (`--erp-font-family` in `@erp/ui` `_tokens.scss`). Material theme plain/brand families match. Shell `styles.scss` loads Scoutie Sans (400/600/700) + Material Icons only. Do not introduce additional UI text font families.

**Rationale**: User direction during Shell sidebar polish; keep one brand typeface across Shell and shared UI.

**Alternatives considered**: Roboto Slab; prior Source Sans 3 + Fraunces pair — removed.
