# Quickstart: ERP Sidebar Navigation

**Feature**: `004-erp-sidebar-nav` | **Date**: 2026-09-10

Validation guide for reviewers after implementation. See [contracts/shell-sidebar-contracts.md](./contracts/shell-sidebar-contracts.md) and [data-model.md](./data-model.md).

Updated 2026-09-15: sidebar under topbar; no brand header; single component; surface + right border.

---

## Prerequisites

- Node modules installed under `frontend/`
- Ability to log in with existing Shell auth
- Desktop viewport tall enough to exercise menu overflow

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

### 1. Login has no sidebar

1. Open `/login` while logged out.
2. **Expect**: Full-page login only — no ERP sidebar.

### 2. Authenticated sidebar under topbar + scrollable menu

1. Sign in.
2. **Expect**: Full-width topbar with brand; sidebar under the topbar on the left.
3. **Expect**: Sidebar has **no** brand/logo header region.
4. Expand several nested groups until the menu overflows; scroll the menu area.
5. **Expect**: Topbar stays fixed; only the sidebar menu area scrolls.
6. **Expect**: Sidebar surface background present; right border only; no box-shadow.

### 3. Section headers are not expandable

1. Click labels such as `SALES`, `FINANCE`, `MASTER DATA`.
2. **Expect**: No expand/collapse.
3. **Expect**: Section headers use accent/primary color.

### 4. Initial collapsed view (clear stored selection first)

1. Clear `localStorage` key `erp.shell.sidebar.selectedNavId` (or use a fresh profile).
2. Soft-refresh the authenticated app.
3. **Expect**: First-level expandable groups collapsed; ADMINISTRATION leaves visible; REPORTS hubs + Supplier Reports expandable.

### 5. Expand / collapse + tree rail

1. Expand SALES → Transactions → Sales Return.
2. **Expect**: Children visible with indentation and vertical tree rail; expand icon on the right switches `chevron_right` ↔ `expand_more`.

### 6. Selection (leaf only)

1. Click Credit Note.
2. **Expect**: Only Credit Note label uses accent + bold; inactive labels stay muted; leading icons remain accent; parents are not selected from expand alone.
3. Expand/collapse Transactions without clicking another leaf.
4. **Expect**: Credit Note remains the selected leaf (until another leaf is chosen).

### 7. Refresh restore

1. With Credit Note selected, refresh the page.
2. **Expect**: Credit Note still selected and visible; ancestor groups (Transactions, Sales Return) expanded.

### 8. Keyboard

1. Tab to an expandable control; Enter/Space toggles expand.
2. Tab to a leaf; Enter/Space selects it.
3. **Expect**: No navigation to missing pages required.

### 9. Hierarchy spot-checks

| Path | Expect |
|------|--------|
| MASTER DATA → Finance | Sibling of Organization |
| PURCHASING → Transactions → Reports | Purchase reports list |
| FINANCE → Cash & Bank → Reports | Leaf |
| REPORTS → Supplier Reports | Management Reports child |
| ADMINISTRATION | System Settings sibling of Audit Trail |

### 10. Content area still works

1. Foundation home still renders beside the sidebar under the topbar.
2. Theme toggle / logout live in the topbar — not in the sidebar.

### 11. Typography

1. Sidebar labels use **Scoutie Sans** (project `--erp-font-family`), not a competing UI text font.

### 12. Single sidebar component

1. Inspect `layout/shell-sidebar/`.
2. **Expect**: Nav tree lives in `shell-sidebar` (no `shell-sidebar-nav/` folder).

---

## Pass criteria

All scenarios match [spec.md](./spec.md) and [shell-sidebar-contracts.md](./contracts/shell-sidebar-contracts.md).
