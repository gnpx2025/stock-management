# Feature Specification: Angular Material Migration

**Feature Branch**: `003-angular-material-migration`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "Update the existing frontend implementation to completely remove PrimeNG and migrate the project to Angular Material. Inspect the existing Nx + Angular codebase first; do not recreate the application. Do not implement toolbar/topbar or sidebar/sidenav. Establish Angular Material as the primary UI foundation with centralized theme in libs/ui, preserve existing behavior (login, forms, notifications, loading, routes, federation), remove all PrimeNG/PrimeIcons/@primeng/themes usage, and pass lint/type-check/build/tests."

## Constitution Alignment

This feature implements the Constitution v3.0.0 frontend UI library change: Angular Material is the primary UI component library; PrimeNG and competing UI libraries are forbidden; reusable ERP UI and centralized theming live in `libs/ui`; SCSS continues; Native Federation and backend architecture are unchanged.

**Noted alignment adjustments (not conflicts):**

- Constitution assigns Shell ownership of sidenav, toolbar, global navigation, theme, global loader, and global notifications. This feature migrates theme, loader, and notification foundations to Angular Material and removes the temporary Shell header/aside (content-only Shell). It MUST NOT implement the full ERP toolbar/topbar, sidebar/sidenav, or navigation menu system—those remain a later Shell feature.
- Constitution allows ERP-specific reusable compositions in `libs/ui` when consistency across features is needed. This feature centralizes shared presentation controls (`erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip`, `erp-form-field` + `erpPrefix`/`erpSuffix`) in `@erp/ui` while keeping Material as the underlying foundation.
- Existing Platform Foundation and Login Authentication behaviors MUST remain intact except for UI component and theming substitutions required by this migration.

## Clarifications

### Session 2026-09-09

- Q: For the Shell’s existing minimal header (brand + theme/logout actions) and aside navigation links, what should this migration do? → A: Remove header/aside entirely; leave a content-only Shell until a later Shell layout feature
- Q: When setting up the centralized Angular Material theme, should it reuse the ERP’s existing brand tokens (colors, typography, spacing) or start from Material defaults? → A: Map Material theme to existing ERP tokens (colors, typography, spacing)
- Q: Should this feature also update earlier platform specs/docs that still require PrimeNG as the primary UI library? → A: Update conflicting prior specs/docs that still require PrimeNG
- Q: After removing the temporary Shell header, how should logout remain available during this migration? → A: Add a minimal content-area logout control (not toolbar/sidebar)
- Q: For migrated login and foundation controls, what accessibility bar must this feature meet for acceptance? → A: Material defaults + smoke-check keyboard focus and labels on primary flows

### Session 2026-09-09 (post-implement refinements)

- Q: Should repeated Shell controls use shared ERP components in `libs/ui` instead of importing Angular Material directly everywhere? → A: Yes — provide `erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip` in `@erp/ui` and consume them from Shell features/layout
- Q: How must each shared UI component be structured? → A: Separate `.ts`, `.html`, and `.scss` files per component (no inline templates/styles)
- Q: Where should semantic/brand colors live so components do not hardcode hex values? → A: Centralize in `libs/ui/src/styles/_colors.scss`; components and app SCSS MUST use `--erp-color-*` variables
- Q: Should common layout helpers (e.g. flex/grid display) be shared? → A: Yes — curated utility classes in `libs/ui/src/styles/_utilities.scss` (e.g. `d-flex`, `gap-*`, `m-*`/`p-*`); use them in templates where layout matches; this is not Tailwind or another utility CSS framework

### Session 2026-09-10 (form-field composition + foundation UI lab)

- Q: Should login and other Shell forms keep raw `mat-form-field` / `matInput`, or is a shared form composition justified? → A: Yes — provide `erp-form-field` in `@erp/ui` that owns Material form-field chrome (label, hint, error, appearance) and renders each MatFormFieldControl type in-template (`input`, `textarea`, `select`, `native-select`, `datepicker`, `date-range`, `timepicker`, `autocomplete`, `chip-grid`); project adornments via `erpPrefix` / `erpSuffix`
- Q: How should reactive `disabled` be applied on `erp-form-field`? → A: Via the FormControl API (`enable`/`disable`), not `[disabled]` beside `formControlName`
- Q: Should foundation home expose a temporary theme toggle and form-control lab? → A: Yes — content-area theme toggle beside logout; UI-lab card exercising every `erp-form-field` control type (temporary verification surface, not a product settings UI)

### Session 2026-09-10 (project typography)

- Q: What is the project-wide UI typeface? → A: **Scoutie Sans** only — owned by `--erp-font-family` in `libs/ui/src/styles/_tokens.scss`; Material `plain-family` / `brand-family` map to Scoutie Sans; load via Shell `styles.scss` Google Fonts (weights 400/600/700) alongside Material Icons; do not ship competing UI text fonts (no Source Sans / Fraunces / Roboto Slab / system UI stacks / monospace UI text)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove the former UI library and adopt the approved design system (Priority: P1)

As a platform developer, I can open the existing frontend workspace and confirm that the approved primary UI component library is fully in place, the former primary UI library and its icons/themes are gone, and no competing UI libraries have been introduced—so the monorepo matches the ratified constitution.

**Why this priority**: Governance and long-term consistency depend on a single UI foundation; leaving dual libraries creates drift and blocks future Shell work.

**Independent Test**: Search the frontend workspace and package manifests for the former UI library, its icons package, and its theme package; confirm zero runtime/source dependencies remain (except migration documentation if any); confirm the approved UI library and shared design-system foundation are present and used by Shell/shared UI.

**Acceptance Scenarios**:

1. **Given** the existing frontend workspace after migration, **When** a developer reviews package dependencies, **Then** the former primary UI library, its icons package, and its dedicated theme package are not installed, and no competing third-party UI component libraries or utility CSS frameworks have been added.
2. **Given** the migrated codebase, **When** a developer searches application and library source for former-library imports, templates, directives, services, theme providers, CSS, and icon classes, **Then** no remaining usage is found outside optional migration documentation.
3. **Given** the shared UI foundation, **When** a developer inspects theming and design tokens, **Then** a single centralized theme/design-system configuration exists for Shell and future micro-frontends, mapped to the existing ERP brand tokens (colors, typography, spacing, and related tokens) including light/dark where already supported, without per-MFE independent themes.

---

### User Story 2 - Keep login and foundation screens working with the new UI foundation (Priority: P1)

As an ERP user or reviewer, I can still open the Shell, use the login screen, view the foundation home (health/demo hooks), see global loading and notifications, and navigate existing routes—with the same business behavior and validation rules as before the migration—even though the temporary header/aside chrome is removed pending a later Shell layout feature.

**Why this priority**: Migration success is measured by preserved product behavior, not by visual redesign.

**Independent Test**: Start Shell (and backend where needed); exercise login happy path and validation failures; open foundation home; trigger demo loader and notification; confirm routes and API health display still work without relying on the removed header/aside chrome.

**Acceptance Scenarios**:

1. **Given** a running Shell after migration, **When** a user completes login with valid credentials, **Then** authentication succeeds with the same validation rules and post-login behavior as before (no business-rule changes).
2. **Given** the login screen, **When** a user submits invalid or incomplete credentials, **Then** the same validation and error feedback behaviors remain available through the new UI controls.
3. **Given** the foundation home, **When** a reviewer views runtime configuration and platform health and uses demo loader/notification actions, **Then** those capabilities remain available and use the migrated UI/notification/loading foundations.
4. **Given** the Shell after migration, **When** a reviewer inspects the authenticated shell chrome, **Then** the previous temporary header and aside are absent (content-only shell), and no new ERP toolbar/sidebar/navigation feature has been introduced.
5. **Given** an authenticated session on foundation home (or equivalent content surface), **When** the user activates the minimal content-area logout control, **Then** the session ends with the same logout behavior as before (without restoring header/aside chrome).
6. **Given** an authenticated session on foundation home, **When** the user activates the content-area theme toggle, **Then** light/dark mode switches via `ThemeService` (`.app-dark` / `color-scheme`) without restoring header chrome.
7. **Given** foundation home, **When** a reviewer opens the form-field UI lab, **Then** every `erp-form-field` control type is exercisable for visual/QA verification (temporary lab surface).
8. **Given** existing routes, **When** a user navigates among currently implemented Shell screens (including via direct URLs where chrome links were removed), **Then** routing behavior for those routes remains available (no route redesign).
9. **Given** login and foundation-home primary controls after migration, **When** a reviewer uses keyboard navigation, **Then** focus moves through interactive controls with visible focus and controls have accessible labels; no separate formal WCAG audit is required in this feature.

---

### User Story 3 - Consume shared UI safely across the monorepo (Priority: P1)

As a frontend developer adding or maintaining Shell screens, I use the shared UI library for reusable ERP UI components and centralized theme/tokens, and I import those through `@erp/ui` rather than duplicating Material markup across apps or importing another micro-frontend’s internals.

**Why this priority**: Correct dependency direction prevents duplicated UI and keeps future MFEs consistent.

**Independent Test**: Review dependency direction for Shell → `@erp/ui` (erp-* components + theme/tokens) → Angular Material; confirm shared components use `.ts`/`.html`/`.scss`; confirm colors come from `_colors.scss`; confirm quality gate enforces Material-only packages.

**Acceptance Scenarios**:

1. **Given** Shell and shared libraries, **When** a developer inspects UI consumption, **Then** reusable ERP presentation components (`erp-button`, `erp-spinner`, `erp-icon`, `erp-card`, `erp-status-chip`, `erp-form-field`), theme, and tokens live in the shared UI library and applications import them through the `@erp/ui` public API.
2. **Given** a repeated standard control used across Shell surfaces (button, spinner, icon, card, status chip, form field), **When** features render that control, **Then** they use the shared `erp-*` component rather than duplicating Material markup.
3. **Given** workspace quality gates for competing UI libraries, **When** a developer attempts to add a forbidden UI stack, **Then** the gate reflects Angular Material as the allowed foundation and rejects competing libraries (including the removed former library).
4. **Given** shared UI component sources, **When** a developer opens any `erp-*` component, **Then** it has separate `.ts`, `.html`, and `.scss` files and SCSS references `--erp-color-*` tokens rather than hardcoded hex colors for semantic/brand colors.
5. **Given** Shell templates for login, foundation home, layout, and global loader, **When** a developer inspects common layout markup, **Then** curated utilities from `_utilities.scss` (e.g. `d-flex`, `d-grid`, `gap-*`) are used where they replace duplicated layout declarations, without introducing Tailwind or another utility framework.
6. **Given** login and foundation form surfaces, **When** a developer inspects form fields, **Then** they use `erp-form-field` (with `control` / `controlName` / options / date-range start-end names as needed) and optional `erpPrefix`/`erpSuffix` adornments rather than raw `mat-form-field` composition.

---

### User Story 4 - Prove quality after migration (Priority: P2)

As a contributor or CI pipeline, I can lint, type-check, test, and production-build the affected frontend projects successfully after the migration, with any pre-existing unrelated failures clearly documented.

**Why this priority**: A migration that breaks the build is incomplete.

**Independent Test**: Run frontend lint, type-check/build, and tests for affected apps/libs; confirm production build succeeds; document any failures proven unrelated to this migration; spot-check prior specs/docs for removed PrimeNG mandates.

**Acceptance Scenarios**:

1. **Given** the migrated frontend, **When** lint and type checking run on affected applications and libraries, **Then** they pass.
2. **Given** the migrated frontend, **When** unit/integration tests for affected projects run, **Then** they pass, or any failures are documented as pre-existing and unrelated to this migration.
3. **Given** the migrated frontend, **When** a production build of affected applications runs, **Then** the build succeeds.
4. **Given** prior platform/feature specs and developer docs that previously required PrimeNG, **When** a reviewer checks current requirements language, **Then** those artifacts no longer mandate PrimeNG as the primary UI library and instead align with Angular Material / Constitution v3.0.0.

---

### Edge Cases

- What if a former-library control has no one-to-one equivalent? Prefer the closest approved-library or platform control; if still insufficient, add an ERP-specific reusable component in the shared UI library—not a new third-party UI library.
- What if notification or loading foundations currently depend on former-library services/components? Migrate them to the approved library/CDK (or existing Shell/core facade) while preserving user-visible behavior; do not invent a new global loading architecture in this feature.
- What if templates contain former-library utility/icon classes or deep style overrides? Remove or replace them with Material/SCSS/shared tokens; do not introduce a utility CSS framework.
- What if workspace scripts still allow the former library and forbid the approved one? Update those gates so the constitutionally approved library is allowed and competing libraries (including the removed one) are blocked.
- What if icons previously came from the former icon set? Replace with the approved icon strategy (Material icons/symbols) consistently for standard UI icons.
- What if accessibility regressions appear after control substitution? Fix focus order, visible focus, and labels on primary login/foundation flows using Material defaults; defer formal WCAG audit work beyond that smoke-check.
- What if someone expects a full ERP sidebar/toolbar as part of this work? Explicitly out of scope—the existing temporary header and aside MUST be removed in this migration, leaving a content-only Shell; a minimal content-area logout control MUST remain available so authenticated logout still works; a minimal content-area theme toggle MAY be present on foundation home for verification while centralized light/dark theme support remains in shared UI; no new application shell layout, navigation menu, toolbar, or sidenav feature is delivered here.
- What if nested `ng-content` of a Material form control into a wrapped `mat-form-field` fails MatFormFieldControl discovery? Own the control in the `erp-form-field` template (typed `control` switch) rather than projecting the control; keep prefix/suffix projection only.

## Requirements *(mandatory)*

### Functional Requirements

#### Scope and non-goals

- **FR-001**: This feature MUST migrate the **existing** Nx + Angular frontend; it MUST NOT create a new project or recreate the application from scratch.
- **FR-002**: This feature MUST NOT implement ERP toolbar/topbar, sidebar/sidenav, global navigation menu, or a redesigned application shell layout. The existing temporary Shell header and aside MUST be removed, leaving a content-only Shell until a later Shell layout feature. A minimal logout control MUST remain available in content (for example foundation home), not as toolbar/sidebar chrome. A minimal content-area theme toggle MAY be provided on foundation home for verification; centralized light/dark theme support in shared UI MUST remain available for future chrome.
- **FR-003**: This feature MUST NOT change Native Federation architecture, micro-frontend boundaries, application routing design, or backend architecture.
- **FR-004**: This feature MUST NOT change business validation rules, authentication rules, or API contracts except where a UI control substitution forces an equivalent interaction (behavior MUST remain equivalent).
- **FR-005**: Before substituting controls, implementers MUST inspect existing frontend usage of the former UI library (dependencies, imports, templates, theme, CSS, icons, shared UI, apps/MFEs) and choose equivalent approved controls intentionally—not via blind text replacement.

#### Primary UI foundation

- **FR-006**: Angular Material MUST be the only primary UI component library for the ERP frontend.
- **FR-007**: Angular CDK MAY be used where appropriate as part of the Material ecosystem.
- **FR-008**: The frontend MUST NOT retain or introduce PrimeNG, PrimeIcons, `@primeng/themes`, competing UI component libraries, or TailwindCSS / other utility CSS frameworks for UI composition.
- **FR-009**: After migration, frontend source and package manifests MUST contain no remaining PrimeNG / PrimeIcons / `@primeng` runtime usage (migration documentation mentions are allowed).

#### Shared UI and consumption

- **FR-010**: Centralized Angular Material theme, shared design tokens (including `_colors.scss`), and reusable ERP-specific UI compositions MUST live in `libs/ui`.
- **FR-011**: Applications and micro-frontends MUST consume reusable shared UI through the `libs/ui` public API; they MUST NOT duplicate those components or import UI from another micro-frontend’s internals.
- **FR-012**: Shared ERP presentation components for repeated controls (at minimum: button, spinner, icon, card, status chip, form field) MUST be provided in `libs/ui` as `erp-*` components and consumed by Shell/features. Do not create wrappers that add no ERP-specific API, styling, or composition value.
- **FR-012a**: `erp-form-field` MUST compose Material form-field chrome (label, hint, error, appearance) and render MatFormFieldControl types in-template via a `control` discriminator: `input` (default), `textarea`, `select`, `native-select`, `datepicker`, `date-range`, `timepicker`, `autocomplete`, `chip-grid`. Adornments MUST project via `erpPrefix` / `erpSuffix`. Select/autocomplete/native-select options SHOULD be data-driven (`options` / `optionGroups`). Reactive `disabled` MUST sync through FormControl enable/disable (not `[disabled]` + `formControlName`). Date/time adapters required by pickers MUST be registered via `provideErpUi()` (e.g. `provideNativeDateAdapter()`).
- **FR-012b**: Login and other Shell forms that previously used raw `mat-form-field` MUST consume `erp-form-field`. Foundation home MAY include a temporary form-field UI lab exercising each control type for QA.
- **FR-013**: Dependency direction MUST remain Application/MFE → `libs/ui` → Angular Material (with `libs/core` / `libs/contracts` used for non-UI shared concerns as already established). Features MAY still import Material modules only when required for content projected into ERP compositions (e.g. none for standard `erp-form-field` usage).

#### Theme, SCSS, and icons

- **FR-014**: All former-library theme configuration, theme CSS, and theme providers MUST be removed.
- **FR-015**: A single centralized theme configuration MUST serve Shell and future MFEs (no independent per-MFE design systems). The Angular Material theme MUST be mapped to the existing ERP design tokens (colors, typography, spacing, and related brand tokens) rather than shipping Material visual defaults as the ERP brand.
- **FR-016**: SCSS MUST remain the styling approach; reusable styles belong in `libs/ui`; application-specific layout styles MAY remain in the app/MFE. Brand and semantic colors MUST be defined as CSS custom properties in `libs/ui/src/styles/_colors.scss` (and related token files); component/app SCSS MUST NOT hardcode semantic/brand hex colors when a token exists.
- **FR-016a**: Curated reusable layout utility classes (e.g. `d-flex`, `d-grid`, `gap-*`, spacing `m-*`/`p-*`, text helpers) MUST live in `libs/ui/src/styles/_utilities.scss` and MUST be available to Shell/MFEs via shared style imports. Templates SHOULD use these utilities where they replace duplicated common layout declarations. This MUST NOT introduce TailwindCSS or another third-party utility CSS framework.
- **FR-017**: Former icon sets MUST be removed; standard UI icons MUST use the approved Material icon strategy consistently (via `erp-icon` / Material Icons).
- **FR-017a**: Each shared `erp-*` UI component in `libs/ui` MUST be implemented as separate `.ts`, `.html`, and `.scss` files (no inline `template` / `styles` blocks).

#### Preserve existing product surfaces

- **FR-018**: Existing login form controls and feedback MUST be migrated to `erp-form-field` / `erp-button` while preserving validation and auth behavior.
- **FR-019**: Existing foundation home cards/tags/buttons/demo actions MUST be migrated while preserving displayed information and demo capabilities. Foundation home MUST provide content-area logout and theme toggle, and MAY include a form-field UI lab for control verification.
- **FR-020**: Existing global notification behavior MUST continue through an Angular Material-based or ERP notification path consistent with shared/core/ui architecture (for example snackbar-based or equivalent shared handler).
- **FR-021**: Existing global loading indicator behavior MUST continue using Angular Material/CDK or the existing Shell loading foundation; this feature MUST NOT introduce a new global loading architecture.
- **FR-022**: Existing tables, dialogs, overlays, menus, and similar surfaces—if present—MUST be migrated to Angular Material/CDK equivalents while preserving data display, sorting, pagination, filtering, selection, loading, and empty-state behavior. (If none exist yet beyond current Shell/login/foundation surfaces, this requirement applies to whatever is present at migration time.)
- **FR-023**: Existing routes and route behavior MUST be preserved. Migrated login and foundation primary controls MUST retain Angular Material accessibility defaults and MUST pass a smoke-check that keyboard focus reaches interactive controls with visible focus states and that controls have accessible labels. A separate formal WCAG audit is out of scope for this feature.

#### Quality gates

- **FR-024**: Affected applications and libraries MUST pass type checking and lint after migration.
- **FR-025**: Affected tests MUST pass, or pre-existing unrelated failures MUST be clearly documented.
- **FR-026**: Production build of affected applications MUST succeed.
- **FR-027**: Workspace scripts/gates that enforce UI library policy MUST be updated to allow Angular Material/CDK and disallow the removed and competing libraries.
- **FR-028**: Conflicting prior feature specs and platform docs that still mandate PrimeNG (or forbid Angular Material) as the primary UI foundation MUST be updated so they align with Constitution v3.0.0 and this migration. Historical narrative may note the prior choice, but current requirements MUST NOT continue to require PrimeNG.

### Key Entities

- **Design System Theme**: The single shared visual configuration consumed by Shell and future MFEs; Angular Material theming is mapped onto ERP tokens from `_colors.scss` / `_tokens.scss` (palette, semantic success/warn/error/info, typography, density, light/dark, spacing, elevation, component appearance). Form-field filled container color uses 10% accent (`--mat-form-field-filled-container-color` via `--erp-color-accent-rgb`).
- **Shared UI Foundation**: The reusable UI layer exposing `erp-*` presentation components (including `erp-form-field`), theme providers, notification facade, and centralized styles. Components use separate `.ts`/`.html`/`.scss` files.
- **Form Field Composition**: `erp-form-field` API — `control`, `controlName` / `startControlName`+`endControlName`, label/hint/error/appearance, options, picker inputs/outputs, `erpPrefix`/`erpSuffix`.
- **Notification Facade**: Existing cross-cutting notification contract used by Shell/features; implementation must continue to deliver user-visible feedback after migration.
- **Global Loading Foundation**: Existing Shell-level loading presentation tied to request/activity hooks; behavior preserved, ownership unchanged; spinner rendered via `erp-spinner`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of former primary UI library packages (component library, icons, dedicated theme package) are absent from frontend package manifests after migration.
- **SC-002**: A full-text search of frontend application and library source finds zero remaining former-library imports, selectors, services, theme providers, CSS imports, or icon class usage (excluding optional migration documentation).
- **SC-003**: Reviewers can complete login and foundation-home verification flows with equivalent behavior to pre-migration (success path, validation/error feedback, health display, demo loader, demo notification, logout via the minimal content-area control, and theme toggle).
- **SC-012**: Login uses `erp-form-field`; foundation home form-field UI lab covers all documented `control` types; shared exports include `ErpFormFieldComponent`, `ErpPrefixDirective`, `ErpSuffixDirective`, and related option types.
- **SC-004**: 100% of previously implemented Shell routes remain reachable (including via direct URL if chrome links were removed) with unchanged route behavior.
- **SC-005**: The temporary Shell header and aside are removed; no ERP toolbar/topbar or sidebar/sidenav feature is newly delivered as part of this work (content-only Shell verified by review).
- **SC-006**: Affected frontend projects pass lint, type-check, and production build; test suites pass or documented exceptions are limited to pre-existing unrelated failures.
- **SC-007**: Future micro-frontends can consume the same centralized theme/shared UI without inventing a second design system (verified by presence of `_colors.scss` / theme bridge, shared `erp-*` components, and an updated policy gate).
- **SC-008**: Conflicting prior specs/docs no longer require PrimeNG as the primary UI library (spot-check of previously conflicting artifacts passes).
- **SC-009**: On login and foundation-home primary flows, keyboard navigation reaches interactive controls with visible focus and accessible labels (smoke-check; no formal WCAG audit required in this feature).
- **SC-010**: Shared `erp-*` components each have separate `.ts`/`.html`/`.scss` files; component SCSS uses `--erp-color-*` tokens (no hardcoded semantic/brand hex for colors covered by `_colors.scss`).
- **SC-011**: Shared `_utilities.scss` exists under `libs/ui/src/styles/` and Shell primary surfaces (login, foundation home, shell layout, global loader) use utility classes for common layout (e.g. `d-flex`/`d-grid`/`gap-*`) instead of duplicating those declarations in feature SCSS where applicable.

## Assumptions

- The current frontend already uses PrimeNG in a limited set of Shell surfaces (login, foundation home, minimal layout chrome, toast notifications, global loader, shared UI theme provider); migration scope matches that existing footprint plus dependency/theme/gate cleanup—not a greenfield UI rewrite.
- Removing temporary header/aside chrome means logout and a minimal theme toggle remain available via content-area controls on foundation home (not restored chrome). Centralized light/dark theme support in shared UI remains available for future Shell chrome.
- Light/dark theme foundation (tokens/providers) will be preserved via the centralized Material theme rather than redesigned as a branding feature. The Material theme maps to existing ERP SCSS/design tokens rather than adopting stock Material brand colors/typography.
- Angular CDK is already available and remains acceptable under the constitution.
- No business micro-frontends beyond Shell are required to exist yet; when they appear later, they inherit this UI foundation.
- Toolbar/sidebar/navigation will be specified and built as a separate subsequent feature on top of this Material foundation.
- Prior specs/docs that still prescribe PrimeNG are in scope for requirement-language updates (not a rewrite of completed historical delivery narratives beyond what is needed to remove conflicting mandates).
- “Preserve behavior” means functional equivalence for users and APIs, not pixel-perfect visual identity with the former theme.
- Password field, messages, tags/status chips, cards, buttons, toast, progress spinner, and form fields are in scope for equivalent Material (or shared UI) substitution based on current usage.
- Accessibility acceptance for this migration is a Material-defaults smoke-check (keyboard focus + labels on primary login/foundation flows), not a formal WCAG audit.
- Shared ERP UI components for button/spinner/icon/card/status-chip/form-field are in scope as `@erp/ui` compositions for cross-surface consistency.
- Color values for brand/semantic UI MUST be maintained in `libs/ui/src/styles/_colors.scss`.
- Curated layout utilities in `_utilities.scss` are in scope; they are owned ERP SCSS helpers, not a third-party utility framework.
- Foundation-home form-field UI lab is a temporary QA surface and may be removed or relocated when product settings UI exists.
