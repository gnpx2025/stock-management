# Quickstart: ERP Sidebar Navigation

**Feature**: `004-erp-sidebar-nav` | **Date**: 2026-09-10

Validation guide for reviewers after implementation. See [contracts/shell-sidebar-contracts.md](./contracts/shell-sidebar-contracts.md) and [data-model.md](./data-model.md).

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

### 2. Authenticated full-height sidebar + fixed brand header

1. Sign in.
2. **Expect**: Sidebar on the left spanning the full viewport height.
3. **Expect**: Top of sidebar shows brand/logo or product name only (no theme/logout in header).
4. Expand several nested groups until the menu overflows; scroll the menu area.
5. **Expect**: Header stays fixed; only the menu area scrolls.

### 3. Section headers are not expandable

1. Click labels such as `SALES`, `FINANCE`, `MASTER DATA`.
2. **Expect**: No expand/collapse.

### 4. Initial collapsed view (clear stored selection first)

1. Clear `localStorage` key `erp.shell.sidebar.selectedNavId` (or use a fresh profile).
2. Soft-refresh the authenticated app.
3. **Expect**: First-level expandable groups collapsed; ADMINISTRATION leaves visible; REPORTS hubs + Supplier Reports expandable.

### 5. Expand / tree rail / icons

1. Expand SALES → Transactions → Sales Return.
2. **Expect**: Right-side Material expand icons (`expand_more` when open).
3. **Expect**: First-level items show leading Material icons.
4. **Expect**: Vertical tree rail under Transactions; child labels align with the Transactions label column; Credit Note nested under Sales Return with its own rail/indent.
5. Collapse Transactions → nested items hide.

### 6. Selection (leaf only)

1. Click Credit Note.
2. **Expect**: Only Credit Note uses accent color + bold weight; parents are not selected from expand alone; no heavy row borders/backgrounds for expand.
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

1. Foundation home still renders beside the sidebar.
2. Theme toggle / logout on content still function — not in sidebar header.

---

## Pass criteria

All scenarios match [spec.md](./spec.md) and [shell-sidebar-contracts.md](./contracts/shell-sidebar-contracts.md).
