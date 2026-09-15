# Feature Specification: ERP Sidebar Navigation

**Feature Branch**: `004-erp-sidebar-nav`

**Created**: 2026-09-10

**Status**: Implemented (with post-implement refinements)

**Input**: User description: "Create the initial sidebar navigation for the ERP application covering only sidebar structure, hierarchy, and layout behavior (full-height sidebar, fixed logo/header, independently scrollable menu, section headers, expandable child groups, initial collapsed state). Explicitly exclude page implementation, routing, APIs, permissions, active-route logic, responsive/mobile behavior, and a new visual theme."

## Constitution Alignment

This feature delivers the Shell’s global sidebar / sidenav navigation structure required by the ERP Platform Constitution (Shell owns sidenav and global navigation). It builds on the content-only Shell left after the Angular Material migration and restores persistent application navigation chrome without implementing destination pages, route wiring, or authorization.

**Noted alignment adjustments (not conflicts):**

- Constitution assigns Shell ownership of sidenav and global navigation. This feature specifies Shell sidebar structure and layout behavior only.
- Visual theme and brand tokens follow existing UI/design standards; first-level and expand icons use the shared Material icon set via `@erp/ui`.
- Permissions, audit, and business transactions remain out of scope; menu items are structural placeholders for later features.

## Clarifications

### Session 2026-09-10

- Q: Should System Settings sit under Audit Trail as a child, or as a separate sibling item in Administration? → A: System Settings and Audit Trail are sibling leaves (both visible initially)
- Q: For Sales Reports, Purchase Reports, Inventory Reports, and Finance Reports under REPORTS, should they be plain leaf items or expandable groups? → A: Leaves now (no expand indicator); children can be added in a later feature
- Q: Must expand and collapse of nested menu groups be fully usable with the keyboard alone (Tab/Enter/Space/arrows), or is pointer-only expand/collapse acceptable for this feature? → A: Keyboard required: focusable groups; Enter/Space expands/collapses
- Q: What should the fixed sidebar logo/header area contain in this feature? → A: Brand/logo or product name only

### Session 2026-09-10 (post-implement refinements)

- Q: Where should the expand/collapse control appear? → A: On the right side of expandable menu rows
- Q: Should first-level parent items show icons? → A: Yes — Material icons via `erp-icon` on first-level items only
- Q: What icon should expand/collapse use? → A: Material icons — `chevron_right` when collapsed, `expand_more` when expanded
- Q: How should expanded nesting look? → A: Vertical tree guide rail under the parent icon (deeper nests get their own rail); child labels align with the parent label column
- Q: How strong should selection highlighting be? → A: Selected leaf only — accent text color and bold weight; no border or heavy background on rows; expandable parents are not selected when toggled
- Q: Should selection survive refresh? → A: Yes — persist selected leaf id; on reload restore selection and expand ancestor groups so the selected item is visible
- Q: How should Shell layout files be organized? → A: One folder per concern under `layout/` (`shell-layout/`, `shell-sidebar/`, `shell-sidebar-nav/`, `global-loader/`, `nav/`); prefer curated `@erp/ui` utility classes for common layout
- Q: What project-wide typeface should the Shell (and shared UI) use? → A: **Scoutie Sans** only (`--erp-font-family`); remove other UI text fonts; Material Icons remain for icons only

### Session 2026-09-15 (chrome layout refinements)

- Q: Should brand stay in the sidebar header? → A: No — brand/logo + product name move to the full-width topbar (005); sidebar has no brand header region
- Q: How does the sidebar sit relative to the topbar? → A: Sidebar sits under the full-width topbar (shell column: topbar, then row of sidebar + content)
- Q: Keep separate `shell-sidebar` and `shell-sidebar-nav` components? → A: No — single `ShellSidebarComponent` owns chrome + nav tree (merge nav into `shell-sidebar/`)
- Q: Sidebar surface treatment? → A: Keep surface background; right border only; no box-shadow
- Q: Section header and icon colors? → A: Primary/accent for section headers and leading icons; inactive item **labels** use muted text; selected leaf uses accent + bold (icons stay accent)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the sidebar under the topbar with a scrollable menu (Priority: P1)

As an authenticated ERP user, I see a left sidebar under the full-width topbar that fills the remaining viewport height beside page content, with a navigation menu area that scrolls independently when the menu is longer than the available space—so I can browse a long menu without affecting the topbar or page body scroll.

**Why this priority**: Layout behavior is the foundation of usable navigation; without independent scroll, long menus become unusable.

**Independent Test**: Open the authenticated application shell with the sidebar present; confirm the sidebar sits under the topbar and fills the remaining height; scroll the menu area and confirm only the navigation area scrolls.

**Acceptance Scenarios**:

1. **Given** an authenticated session with the Shell layout visible, **When** the user views the layout, **Then** the sidebar sits under the full-width topbar and fills the remaining viewport height beside the main content.
2. **Given** the sidebar is displayed, **When** the user inspects its vertical structure, **Then** there is a scrollable navigation menu area (no brand/logo header region inside the sidebar).
3. **Given** the navigation menu content exceeds the available height, **When** the user scrolls within the navigation menu area, **Then** the menu content scrolls vertically and the topbar remains fixed and fully visible.
4. **Given** the navigation menu is scrolling, **When** the user observes scrolling, **Then** scrolling does not move the topbar or the main content body scrollbar independently incorrectly.

---

### User Story 2 - Browse the complete menu hierarchy with section headers (Priority: P1)

As an ERP user, I can see all defined business sections (OPERATIONS through UTILITIES) as non-interactive visual grouping headers, with the correct menu items nested under each section, so I can locate modules by business domain without confusing section titles for clickable folders.

**Why this priority**: Correct hierarchy and non-expandable section headers define how the entire ERP is organized for users.

**Independent Test**: Open the sidebar and walk each section header and its first-level items against the defined structure; attempt to expand a section header and confirm it does not expand/collapse.

**Acceptance Scenarios**:

1. **Given** the sidebar is visible, **When** the user reviews section headers, **Then** the following section headers appear in order: OPERATIONS, SALES, PURCHASING, INVENTORY, FINANCE, MASTER DATA, REPORTS, ADMINISTRATION, UTILITIES.
2. **Given** any section header (for example SALES), **When** the user attempts to expand or collapse that header, **Then** no expand/collapse interaction occurs; only items beneath the header belong to that section.
3. **Given** the SALES section, **When** the user views labels under it, **Then** child labels do not unnecessarily repeat the parent section name (for example, no redundant “Sales” group directly under the SALES header).
4. **Given** the complete hierarchy defined in this specification, **When** a reviewer expands all expandable groups, **Then** every listed leaf and nested item is reachable and nested at the depth defined in Key Entities / Navigation Structure.

---

### User Story 3 - Expand and collapse nested menu groups (Priority: P1)

As an ERP user, I can expand and collapse child groups that have nested items (for example Transactions, Operations, Accounting), with clear expand/collapse indicators and visual indentation for nesting, so I can focus on the part of the menu I need.

**Why this priority**: Nested ERP menus are dense; expand/collapse is required to make the hierarchy usable.

**Independent Test**: From the initial collapsed state, expand a group with children, confirm children appear with indentation and an indicator; collapse the group and confirm children hide.

**Acceptance Scenarios**:

1. **Given** a menu item that has child items (for example SALES → Transactions), **When** the user views that item, **Then** an expand/collapse indicator is shown.
2. **Given** a collapsed expandable item, **When** the user activates it, **Then** its direct children become visible and remain indented to communicate hierarchy.
3. **Given** an expanded expandable item, **When** the user activates it again, **Then** its descendants are hidden and the indicator reflects the collapsed state.
4. **Given** a leaf menu item with no children (for example OPERATIONS → Dashboard), **When** the user views that item, **Then** no expand/collapse indicator is shown.
5. **Given** deeply nested items (for example SALES → Operations → Reports → Sales Summary), **When** the user expands each ancestor in turn, **Then** each level remains visually indented relative to its parent, child labels align with the parent label column, and a vertical tree guide rail marks each expanded group.
6. **Given** a keyboard user focused on a collapsed expandable item, **When** they press Enter or Space, **Then** the group expands; pressing Enter or Space again collapses it.
7. **Given** the navigation menu, **When** a keyboard user tabs through interactive menu items, **Then** expandable groups and leaf items can receive focus in a sensible order.
8. **Given** an expandable item, **When** the user views the row, **Then** the expand/collapse Material icon appears on the right (`chevron_right` collapsed, `expand_more` expanded).
9. **Given** a first-level item under a section, **When** the user views it, **Then** a Material leading icon is shown for that first-level item (nested levels do not require leading icons).

---

### User Story 4 - Land on the defined initial collapsed navigation state (Priority: P2)

As an ERP user opening the application with no prior selection, I first see the sidebar in the defined initial collapsed form—section headers visible, first-level items listed, and expandable groups collapsed—so the menu starts compact and consistent.

**Why this priority**: Initial state sets first impression and reduces overwhelm; secondary to having correct layout and hierarchy.

**Independent Test**: Load the authenticated shell with no stored selection and compare visible items to the Initial Collapsed Sidebar View.

**Acceptance Scenarios**:

1. **Given** the application has just loaded the sidebar with no stored selection, **When** the user views the navigation area, **Then** expandable first-level groups under each section appear collapsed (showing the expand indicator where children exist) as defined in the Initial Collapsed Sidebar View.
2. **Given** the initial collapsed state, **When** the user views OPERATIONS, **Then** Dashboard is visible as a leaf item.
3. **Given** the initial collapsed state, **When** the user views SALES, **Then** Transactions and Operations appear as collapsed expandable items (children not visible until expanded).
4. **Given** the initial collapsed state, **When** the user views ADMINISTRATION, **Then** Users, Roles & Permissions, Company Settings, Branch Settings, Document Numbering, Approval Workflows, Audit Trail, and System Settings are visible as leaf items.
5. **Given** the initial collapsed state, **When** the user views UTILITIES, **Then** Import Data, Export Data, Data Validation, and System Tools are visible as leaf items.
6. **Given** the initial collapsed state, **When** the user views REPORTS, **Then** Sales Reports, Purchase Reports, Inventory Reports, Finance Reports, Customer Reports are visible as leaves, and Supplier Reports appears as a collapsed expandable item.

---

### User Story 5 - Select a leaf and restore it after refresh (Priority: P2)

As an ERP user, I can select a leaf menu item and see only that leaf highlighted (accent color and bold weight). Expandable parents are not highlighted when opened. After refresh, the same leaf remains selected and its ancestor groups reopen so the item stays visible.

**Why this priority**: Selection feedback and continuity improve orientation without implying route navigation.

**Independent Test**: Select a nested leaf (e.g. Credit Note); confirm only that leaf is highlighted; refresh; confirm selection and ancestor expand path restore.

**Acceptance Scenarios**:

1. **Given** a visible leaf item, **When** the user activates it, **Then** that leaf becomes the selected item (accent text + bold) and no other row shows selection styling.
2. **Given** an expandable parent, **When** the user expands or collapses it, **Then** the parent is not marked selected solely because it was toggled.
3. **Given** a selected leaf, **When** the user refreshes the authenticated shell, **Then** the same leaf is selected again and its ancestor expandable groups are expanded so the leaf is visible.
4. **Given** menu rows, **When** the user inspects default and selected styling, **Then** rows do not use heavy borders or strong background fills for expand state; selection uses text emphasis only.

---

### Edge Cases

- When the viewport height is short, the topbar remains fully visible and only the sidebar navigation area scrolls.
- When a deeply nested path is expanded such that total menu height greatly exceeds the viewport, scrolling remains confined to the navigation area.
- When multiple sibling groups are expanded at once, all remain independently expandable/collapsible without collapsing unrelated siblings.
- When a parent group is collapsed, nested expanded state of its children is cleared for that branch.
- Leaf items may be presented as non-navigating placeholders in this feature (no page or route behavior required).
- Empty expandable groups MUST NOT appear; only items that have defined children show expand/collapse controls.
- If a stored selection id no longer exists in the menu data, the sidebar falls back to the initial collapsed view with no selection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sidebar MUST sit under the full-width Shell topbar and fill the remaining viewport height beside main content.
- **FR-002**: The sidebar MUST NOT contain a brand/logo header region; brand/product name lives in the topbar (005).
- **FR-003**: The sidebar MUST contain a navigation menu area that scrolls vertically independently when content overflows.
- **FR-004**: Scrolling the navigation menu MUST NOT move the topbar out of view.
- **FR-005**: The navigation MUST present section headers for: OPERATIONS, SALES, PURCHASING, INVENTORY, FINANCE, MASTER DATA, REPORTS, ADMINISTRATION, and UTILITIES, in that order.
- **FR-006**: Section headers MUST be visual grouping labels only and MUST NOT support expand/collapse interaction. Section header text MUST use the primary/accent color.
- **FR-007**: Menu items listed under a section header MUST belong to that section and MUST NOT introduce an extra expandable level for the section header itself.
- **FR-008**: Items that have child items MUST show an expand/collapse indicator on the right and MUST allow the user to expand and collapse those children.
- **FR-009**: Nested items MUST communicate hierarchy through progressive indentation, vertical tree guide rails on expanded groups, and child label alignment with the parent label column.
- **FR-010**: Labels MUST avoid unnecessarily repeating the parent section name inside that section’s navigation.
- **FR-011**: On initial load with no stored selection, the sidebar MUST present the Initial Collapsed Sidebar View: expandable first-level groups collapsed, with the visible first-level items defined for each section.
- **FR-012**: The complete expandable hierarchy MUST match the Initial Sidebar Structure defined under Key Entities (all modules and nested items listed there).
- **FR-013**: This feature MUST NOT implement destination pages, routing to those destinations, API integration, permission filtering, backend changes, menu data APIs, responsive/mobile sidebar behavior, or a new visual theme.
- **FR-014**: Visual presentation MUST use existing ERP tokens and curated layout utilities; first-level leading icons and expand/collapse icons MUST use Material icons via the shared icon component; UI text MUST use project-wide Scoutie Sans (`--erp-font-family`).
- **FR-015**: Leaf menu items MAY be non-functional placeholders (no navigation required) within this feature’s scope.
- **FR-016**: Under ADMINISTRATION, Audit Trail and System Settings MUST appear as sibling leaf items (System Settings MUST NOT be nested under Audit Trail).
- **FR-017**: Under REPORTS, Sales Reports, Purchase Reports, Inventory Reports, Finance Reports, and Customer Reports MUST be leaf items (no expand/collapse control). Supplier Reports MUST remain expandable with child Management Reports.
- **FR-018**: Expandable menu groups MUST be keyboard-operable: they MUST be focusable, and Enter or Space MUST toggle expand/collapse. Full arrow-key tree navigation is not required for this feature.
- **FR-019**: First-level menu items MUST display a leading Material icon in the primary/accent color; nested levels do not require leading icons.
- **FR-020**: Expand/collapse MUST use Material icons: collapsed `chevron_right`, expanded `expand_more`.
- **FR-021**: Only leaf items MAY be selected. Inactive item labels MUST use muted text color. Selection MUST use accent text color and bold font weight (icons remain accent whether selected or not).
- **FR-022**: Selected leaf id MUST persist across refresh; on load the sidebar MUST restore selection and expand ancestor groups so the selected leaf is visible.
- **FR-023**: Expanding a parent MUST NOT mark that parent as selected.
- **FR-024**: Sidebar chrome MUST use the surface background treatment, a right border only, and MUST NOT use a box-shadow.
- **FR-025**: Navigation chrome and tree behavior MUST live in a single `ShellSidebarComponent` (`layout/shell-sidebar/`); a separate `shell-sidebar-nav` component MUST NOT be required.### Key Entities *(include if feature involves data)*

#### Navigation Structure

**Section headers** (non-expandable): OPERATIONS, SALES, PURCHASING, INVENTORY, FINANCE, MASTER DATA, REPORTS, ADMINISTRATION, UTILITIES.

**OPERATIONS**

- Dashboard (leaf)

**SALES**

- Transactions (expandable)
  - Quotation, Sales Order, Delivery / Dispatch, Sales Invoice (leaves)
  - Sales Return (expandable) → Credit Note
- Operations (expandable)
  - Point of Sale (leaf)
  - Counter Sales (expandable) → Customer Orders
  - Reports (expandable) → Sales Summary, Sales Detail, Sales by Customer, Sales by Item, Sales by Salesman, Sales by Outlet

**PURCHASING**

- Transactions (expandable)
  - Purchase Request, Purchase Order, Goods Receipt (leaves)
  - Purchase Invoice (expandable) → Purchase Return
  - Reports (expandable) → Purchase Summary, Purchase Detail, Supplier Analysis, Purchase by Item

**INVENTORY**

- Transactions (expandable)
  - Stock Receipt, Stock Issue, Stock Transfer, Stock Adjustment (leaves)
  - Stock Opening (expandable) → Stock Return
- Operations (expandable)
  - Stock Count (leaf)
  - Batch Management (expandable) → Serial Number Management
  - Reports (expandable) → Stock Summary, Stock Ledger, Stock Valuation, Fast Moving Items, Slow Moving Items, Non Moving Items

**FINANCE**

- Accounting (expandable) → Chart of Accounts, Journal Entry, General Ledger, Trial Balance, Profit & Loss (expandable) → Balance Sheet
- Receivables (expandable) → Customer Receipts, Outstanding Receivables (expandable) → Customer Ledger
- Payables (expandable) → Supplier Payments, Outstanding Payables (expandable) → Supplier Ledger
- Cash & Bank (expandable) → Cash Transactions, Bank Transactions, Bank Reconciliation (expandable) → Cash Position; Reports (leaf)

**MASTER DATA**

- Parties (expandable) → Customers, Suppliers, Salesmen (expandable) → Contacts
- Products (expandable) → Items, Categories, Item Groups, Brands, Units (expandable) → Unit Conversions
- Organization (expandable) → Companies, Branches, Departments, Warehouses (expandable) → Locations
- Finance (expandable; sibling of Organization under MASTER DATA, distinct from the top-level FINANCE section) → Currencies, Banks, Tax Codes, Payment Terms, Payment Methods

**REPORTS**

- Sales Reports, Purchase Reports, Inventory Reports, Finance Reports, Customer Reports (leaves)
- Supplier Reports (expandable) → Management Reports

**ADMINISTRATION**

- Users, Roles & Permissions, Company Settings, Branch Settings, Document Numbering, Approval Workflows, Audit Trail, System Settings (leaves)

**UTILITIES**

- Import Data, Export Data, Data Validation, System Tools (leaves)

#### Initial Collapsed Sidebar View (visible first-level items)

| Section        | Visible items (expandable marked with >) |
|----------------|------------------------------------------|
| OPERATIONS     | Dashboard |
| SALES          | Transactions >, Operations > |
| PURCHASING     | Transactions > |
| INVENTORY      | Transactions >, Operations > |
| FINANCE        | Accounting >, Receivables >, Payables >, Cash & Bank > |
| MASTER DATA    | Parties >, Products >, Organization >, Finance > |
| REPORTS        | Sales Reports, Purchase Reports, Inventory Reports, Finance Reports, Customer Reports, Supplier Reports > |
| ADMINISTRATION | Users, Roles & Permissions, Company Settings, Branch Settings, Document Numbering, Approval Workflows, Audit Trail, System Settings |
| UTILITIES      | Import Data, Export Data, Data Validation, System Tools |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a standard desktop viewport, reviewers confirm the sidebar sits under the topbar and fills the remaining height beside content in 100% of layout checks.
- **SC-002**: When the menu content is taller than the available sidebar height, scrolling the menu keeps the topbar fully visible in 100% of trials.
- **SC-003**: 100% of defined section headers appear in the specified order and none of them expand or collapse when activated; section headers use accent/primary color.
- **SC-004**: 100% of expandable groups listed in the Initial Sidebar Structure can be expanded to reveal their defined children and collapsed to hide them.
- **SC-005**: On first load, 100% of first-level expandable groups that have children start collapsed, matching the Initial Collapsed Sidebar View.
- **SC-006**: A reviewer can locate any leaf item in the defined hierarchy in under 30 seconds by expanding the appropriate groups (without using search).
- **SC-007**: Nested items are visually distinguishable by indentation and tree guide rails at each depth for all nested levels in the structure.
- **SC-008**: Scope remains structural: no destination pages, route wiring, permission gating, or API-driven menu loading are required for acceptance of this feature.
- **SC-009**: In a keyboard-only pass, a reviewer can expand and collapse every first-level expandable group using focus plus Enter or Space without using a pointer.
- **SC-010**: After selecting a nested leaf and refreshing, the same leaf is selected and visible (ancestors expanded) in 100% of refresh checks.
- **SC-011**: Only the selected leaf shows accent + bold emphasis on its label; inactive labels use muted text; leading icons remain accent; expandable parents do not appear selected merely from being expanded.
- **SC-012**: Sidebar uses surface background + right border and no box-shadow; brand is not rendered inside the sidebar.

## Assumptions

- The sidebar is shown in the authenticated Shell layout; unauthenticated/login chrome is unchanged by this feature.
- “Remaining viewport height” means the height under the full-width topbar used by the Shell layout main row.
- Brand/logo + product name live in the topbar (005); the sidebar has no brand header (confirmed 2026-09-15). Earlier 2026-09-10 brand-in-sidebar clarification is superseded.
- Where the full hierarchy nested System Settings under Audit Trail but the initial collapsed view listed both as visible siblings, **System Settings and Audit Trail are sibling leaves** (confirmed 2026-09-10). No empty expand/collapse control is shown on Audit Trail.
- Where the initial collapsed view marked Sales/Purchase/Inventory/Finance Reports with expand indicators but listed no children, those four items plus Customer Reports are **leaves** (confirmed 2026-09-10). Supplier Reports expands to Management Reports. All six REPORTS entries appear under REPORTS.
- MASTER DATA → Finance is a sibling group of Parties/Products/Organization under MASTER DATA, not nested under Organization.
- PURCHASING → Reports is nested under Transactions (as in the provided hierarchy).
- SALES/INVENTORY → Reports are nested under Operations.
- FINANCE → Cash & Bank → Reports is a leaf with no children in this feature.
- Selected leaf id is persisted locally for refresh restore; full expand-state map need not be persisted independently (ancestors are derived from the selected leaf).
- Clicking leaf items need not navigate anywhere for acceptance of this feature.
- Responsive/mobile drawer behavior remains out of scope; topbar coexistence is required (005).
- Layout helpers come from curated `@erp/ui` `_utilities.scss` where applicable; Shell sidebar code lives in a single `layout/shell-sidebar/` component folder (nav merged; no separate `shell-sidebar-nav/`).
- Project UI text font is Scoutie Sans (`--erp-font-family`); Material Icons remain for icon glyphs only.
