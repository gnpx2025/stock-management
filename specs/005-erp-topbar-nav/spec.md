# Feature Specification: ERP Topbar Navigation

**Feature Branch**: `005-erp-topbar-nav`

**Created**: 2026-09-10

**Status**: Implemented

**Input**: User description: "Create the topbar/header for the ERP application covering sticky topbar layout, left-side search input (UI-only), right-side notification button (UI-only), dark/light theme toggle wired to the existing theme mechanism, and a profile button showing the user name with a Logout action wired to existing authentication. Explicitly exclude search/notification APIs and functionality, profile pages, new auth/theme architecture, backend/API/database changes, and unrelated refactoring."

## Constitution Alignment

This feature delivers the Shell’s global topbar / toolbar required by the ERP Platform Constitution (Shell owns topbar / toolbar, global theme, and authentication entry concerns). It complements the existing sidebar navigation chrome and completes the primary application chrome for authenticated sessions without introducing destination pages, search/notification backends, or new theme/auth systems.

**Noted alignment adjustments (not conflicts):**

- Constitution assigns Shell ownership of topbar / toolbar, global theme, and authentication entry. This feature specifies topbar structure and the minimum required interactions only (theme toggle + logout).
- Reusable controls MUST come from the shared UI foundation (`libs/ui`) rather than introducing competing UI libraries.
- Search and notifications remain UI placeholders only; constitution’s “global notification foundation” is not expanded into a full notification product in this feature.
- Permissions, audit of logout events beyond what the existing auth mechanism already does, and business transactions remain out of scope.

## Clarifications

### Session 2026-09-10

- Q: Should the sticky topbar span only the main content column beside the sidebar, or the full viewport width above both the sidebar and content? → A: Content column only (beside the full-height sidebar)
- Q: When a user clicks or activates the notification button in this feature, what should happen? → A: Enabled and focusable; activating it does nothing (no panel, toast, or menu)
- Q: Without a topbar background color, how should the topbar be visually separated from the page content below it? → A: Subtle bottom border/divider only (no fill, no shadow)
- Q: How should the theme toggle communicate theme state visually? → A: Shows the theme you will switch to (action affordance); accessible name describes the action
- Q: Should the search input allow typing in this feature, even though search does nothing yet? → A: Editable and focusable; typing does not run search, filter, or navigate

### Session 2026-09-10 (post-implement refinements)

- Q: Should the topbar match the sidebar surface treatment? → A: Yes — same surface background as the sidenav; remove bottom border; use a bottom box-shadow matching the sidenav’s shadow direction (rotated downward)
- Q: How should the topbar search control be implemented? → A: Dedicated shared search input component (`erp-search-input`) with custom styled input + autocomplete — do **not** use `erp-form-field` / Material form-field
- Q: Should search autocomplete call APIs or navigate? → A: No — UI-only; local filtering of static stub options is allowed for chrome readiness; no search API, global search, or navigation
- Q: How should search-input styling prefer utilities? → A: Prefer curated `@erp/ui` utility classes for layout/spacing/border; no search-field background fill; component SCSS only for focus/disabled/input resets that utilities cannot express

### Session 2026-09-15 (chrome layout refinements)

- Q: Should the sticky topbar span only the content column, or the full viewport width above sidebar + content? → A: **Full viewport width** above both sidebar and content (supersedes 2026-09-10 content-column-only clarification)
- Q: Where does brand/logo + product name live? → A: Left of the topbar (moved out of the sidebar)
- Q: How is Shell layout structured? → A: Column: full-width topbar, then a row of sidebar + scrollable content body
- Q: Icon button colors in dark mode? → A: Map Material `--mat-sys-on-surface-variant` to ERP muted; `erp-button` icon variant uses ERP text/accent tokens so icons stay visible in light and dark

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep the topbar visible while scrolling content (Priority: P1)

As an authenticated ERP user, I always see the application topbar spanning the full width at the top of the viewport while I scroll the main page content, so global actions and brand remain reachable without scrolling back up.

**Why this priority**: Sticky chrome is the foundation of usable application-level actions; without it, theme and profile controls disappear during normal page work.

**Independent Test**: Open an authenticated Shell page with enough content to scroll; scroll the main content and confirm the topbar stays fixed at the top above both sidebar and content, and does not introduce an unnecessary second scrollbar.

**Acceptance Scenarios**:

1. **Given** an authenticated session with the Shell layout visible, **When** the user views the layout, **Then** a topbar spans the full viewport width above both the sidebar and the main content.
2. **Given** the main page content is taller than the viewport, **When** the user scrolls the page content, **Then** the topbar remains visible at the top of the viewport and does not scroll away with the content.
3. **Given** the existing sidebar is present under the topbar, **When** the user scrolls content and uses the topbar, **Then** sidebar behavior remains intact and the layout does not introduce an unnecessary second scrollbar.
4. **Given** the topbar is displayed, **When** the user inspects its appearance, **Then** it uses the surface background treatment, has no bottom border, and uses a bottom box-shadow for separation from content below.
5. **Given** the topbar is displayed, **When** the user looks at the left side, **Then** brand mark + product name (“ERP Platform”) are present before search.

---

### User Story 2 - See search and notification placeholders in the topbar (Priority: P2)

As an ERP user, I see a search input with autocomplete affordance on the left of the topbar and a notification control on the right, so the chrome is ready for future search and notification capabilities even though search APIs and navigation are not active yet.

**Why this priority**: Placeholders establish the intended chrome layout without blocking delivery of theme and logout; they are valuable for visual completeness but not required for the only functional integrations.

**Independent Test**: Open the authenticated Shell; confirm a left-side custom search field with autocomplete UI and a right-side notification control are present; confirm neither performs API-backed search, navigation, or notification data loading.

**Acceptance Scenarios**:

1. **Given** the topbar is visible, **When** the user looks at the left side, **Then** brand appears first, then a search input is present (custom search control, not a generic form-field chrome).
2. **Given** the search input is present, **When** the user focuses it and types, **Then** the input accepts text; an autocomplete panel MAY show locally filtered static stub suggestions; no search API, global search, or navigation occurs as part of this feature.
3. **Given** the topbar is visible, **When** the user looks at the right side, **Then** a notification button/control is present.
4. **Given** the notification control is present, **When** the user activates it, **Then** nothing visible happens (no panel, toast, menu, or notification list); no notification API behavior occurs.
5. **Given** the search input and notification control, **When** accessibility is reviewed, **Then** the search field has an accessible label or appropriate placeholder, and the notification control has an accessible name (not icon-only without a label/tooltip).
6. **Given** Light or Dark theme is active, **When** the user views icon buttons (notification, theme), **Then** icon colors remain visible and follow ERP text/accent tokens (not stuck on light-theme Material defaults).

---

### User Story 3 - Toggle light and dark theme from the topbar (Priority: P1)

As an ERP user, I can switch between the application’s Light and Dark themes from a topbar control that shows what I will switch to, so I can adjust appearance without leaving my work.

**Why this priority**: Theme toggle is one of the only required functional integrations and is a core Shell-owned global concern.

**Independent Test**: Click the theme toggle from Light and from Dark; confirm the application theme switches using the existing theme mechanism and the control state matches the active theme.

**Acceptance Scenarios**:

1. **Given** the topbar is visible, **When** the user looks at the right side, **Then** a Dark/Light theme toggle control is present.
2. **Given** the application is in Light theme, **When** the user activates the theme toggle, **Then** the application switches to Dark theme using the existing theme mechanism.
3. **Given** the application is in Dark theme, **When** the user activates the theme toggle, **Then** the application switches to Light theme using the existing theme mechanism.
4. **Given** either theme is active, **When** the user inspects the toggle, **Then** the control’s visual affordance indicates the theme the user will switch to, and its accessible name describes that action (derived from the current theme).
5. **Given** theme switching works from the topbar, **When** reviewers inspect the solution, **Then** no second/parallel theme-management system was introduced; the existing theme architecture is reused.

---

### User Story 4 - Open profile menu and log out (Priority: P1)

As an authenticated ERP user, I see my name on a profile control in the topbar, can open a small action menu, and can choose Logout so I can end my session using the existing authentication logout behavior.

**Why this priority**: Logout is the other required functional integration and a primary security/session action for authenticated users.

**Independent Test**: Confirm the profile control shows the current/default user name; open the menu; activate Logout; confirm the existing logout/authentication flow runs (including any existing post-logout redirect).

**Acceptance Scenarios**:

1. **Given** an authenticated session, **When** the user views the right side of the topbar, **Then** a profile control displays the logged-in user’s name (using the existing/default application user value).
2. **Given** the profile control is visible, **When** the user activates it, **Then** a profile/action menu opens.
3. **Given** the profile menu is open, **When** the user reviews available actions, **Then** Logout is present and no additional profile actions (such as Profile, Settings, or Change Password) are required in this feature.
4. **Given** the profile menu is open, **When** the user chooses Logout, **Then** the application uses the existing authentication/logout mechanism (including any existing redirect/navigation after logout).
5. **Given** the profile menu, **When** a keyboard-only user opens the menu and chooses Logout, **Then** both opening the menu and activating Logout are possible without a pointer.

---

### Edge Cases

- What happens when the main content is short and does not scroll? The topbar remains sticky/fixed at the top and usable.
- What happens when the sidebar menu scrolls independently? Topbar sticky behavior and sidebar scroll behavior both continue to work without an unnecessary extra page scrollbar.
- What happens if theme state changes from elsewhere (if supported by the existing theme mechanism)? The topbar toggle must still reflect the current theme when observed after that change.
- Visual separation: topbar uses surface background; no bottom border; bottom box-shadow for separation.
- What happens if the displayed user name is missing or empty from the default/existing source? The profile control remains present and usable for Logout; a sensible fallback label (for example “User” or an empty-safe display) may be used without requiring a user API.
- What happens if logout fails or the existing auth mechanism surfaces an error? This feature relies on existing logout/error handling and does not invent a new auth error UX.
- What happens when the user types in search? Text may be entered; autocomplete MAY filter static stub options locally; no search API, global search, or navigation occur.
- What happens when the user activates the notification control? Nothing visible occurs (no panel, toast, or menu); the control stays enabled for future notification work.
- Narrow desktop widths: topbar content should use horizontal space efficiently without breaking the sidebar-under-topbar layout; dedicated mobile/responsive topbar redesign is out of scope unless already required by the existing Shell conventions.
- Topbar horizontal placement: the topbar spans the full viewport width; brand is on the left of the topbar; the sidebar starts below it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The authenticated Shell MUST present a dedicated topbar/header component spanning the **full viewport width** above both the sidebar and the main content.
- **FR-002**: The topbar MUST remain sticky/fixed at the top of the viewport while main page content scrolls and MUST NOT scroll away with that content.
- **FR-003**: Sticky topbar behavior MUST work correctly with the sidebar-under-topbar shell layout and MUST NOT introduce an unnecessary second scrollbar.
- **FR-004**: The topbar MUST use the surface background treatment. Separation from page content MUST use a bottom box-shadow. The topbar MUST NOT use a bottom border/divider for separation.
- **FR-005**: The topbar MUST use available horizontal space efficiently, with brand then search on the left and action controls on the right.
- **FR-005a**: The left side of the topbar MUST include brand mark + product name (“ERP Platform”) before the search control.
- **FR-006**: The left side of the topbar MUST include an editable, focusable search input provided by a dedicated shared search component with custom input styling and autocomplete (not `erp-form-field`). Typing MUST NOT invoke a search API, global search, or navigation in this feature; local filtering of static stub suggestions for autocomplete UI is allowed.
- **FR-007**: The right side of the topbar MUST include a notification button/control that is UI-only. The control MUST remain enabled and focusable; activating it MUST do nothing (no panel, toast, menu, notification data, or notification API integration) in this feature.
- **FR-008**: The right side of the topbar MUST include a Dark/Light theme toggle that switches between the application’s existing Light and Dark themes.
- **FR-009**: The theme toggle MUST reuse the existing theme service/state/mechanism and MUST NOT introduce a second theme-management implementation or a new theme architecture.
- **FR-010**: The theme toggle MUST reflect the current theme by presenting an action affordance for the opposite theme (what the user will switch to) and an accessible name that describes that action.
- **FR-011**: The right side of the topbar MUST include a profile control that displays the logged-in user’s name from the existing/default application user value (no user API integration required).
- **FR-012**: Activating the profile control MUST open a profile/action menu.
- **FR-013**: The profile menu MUST contain Logout as the only required action and MUST NOT add Profile, Settings, Change Password, or other profile actions in this feature.
- **FR-014**: Logout MUST wire to the application’s existing logout/authentication mechanism and MUST reuse any existing post-logout redirect/navigation; no new authentication system may be created.
- **FR-015**: Interactive topbar controls MUST follow standard accessibility practices: accessible names/labels or tooltips where icons alone are insufficient; search accessible label or placeholder; theme toggle accessible name describes the switch action based on current theme; profile menu and Logout are keyboard accessible.
- **FR-016**: Reusable topbar UI elements MUST use existing shared UI library components where an appropriate component already exists (including the shared search input); competing/external UI components MUST NOT be introduced when an equivalent shared component exists.
- **FR-017**: The topbar MUST be implemented as its own Shell layout component with separated TypeScript, markup, and stylesheet files (no large inline template or inline stylesheet in the TypeScript file), following existing project naming and layout-folder conventions.
- **FR-018**: Styling MUST reuse existing utility style classes where applicable (including for the shared search input layout/border/spacing); component-specific styles are allowed only for genuinely specific needs; search input MUST NOT use a background fill; no alternate styling framework may be introduced.
- **FR-019**: This feature MUST NOT implement search APIs, notification functionality, notification APIs, global search navigation, user profile pages/APIs, additional profile actions, new authentication architecture, new theme architecture, backend changes, database changes, or new API endpoints.
- **FR-020**: Existing sidebar and Shell behavior MUST remain intact under the topbar; unrelated features and unrelated refactoring MUST NOT be introduced.
- **FR-021**: Icon buttons (`erp-button` variant `icon`) MUST remain visible in both Light and Dark themes via ERP-mapped Material system tokens and/or component token overrides.

### Key Entities *(include if feature involves data)*

- **Topbar**: Application-level header chrome spanning full width containing brand, left search placeholder, and right action cluster (notification placeholder, theme toggle, profile).
- **Brand**: Mark + product name shown on the left of the topbar.
- **Theme Preference**: The application’s current Light or Dark appearance, owned by the existing theme mechanism and reflected by the topbar toggle via an action affordance for the opposite theme.
- **Session User Display**: The display name shown on the profile control, sourced from the existing/default authenticated user context (not a new user profile API).
- **Profile Menu**: Small action menu opened from the profile control; for this feature contains only Logout.
- **Logout Action**: Ends the authenticated session via the existing authentication/logout mechanism.
- **Notification Placeholder**: Right-side control that is enabled and focusable but performs no action when activated in this feature.
- **Search Placeholder**: Left-side editable custom search input with autocomplete UI for chrome readiness; local stub suggestions only; no search API or navigation in this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a standard desktop viewport with scrollable page content, the topbar remains fully visible spanning the full width above sidebar + content in 100% of scroll checks.
- **SC-002**: Reviewers confirm the topbar uses the surface background, has no bottom border, and uses a bottom box-shadow for separation, in 100% of visual checks.
- **SC-003**: 100% of required topbar elements are present: brand; left search input with autocomplete affordance; right notification control; theme toggle; profile control showing a user name.
- **SC-004**: Theme toggle successfully switches Light ↔ Dark using the existing theme mechanism in 100% of trials; after each switch the control’s action affordance and accessible name match the opposite (next) theme; icon buttons remain visible in both themes.
- **SC-005**: Opening the profile control reveals a menu that includes Logout and no other required profile actions in 100% of trials.
- **SC-006**: Choosing Logout invokes the existing logout/authentication flow (including any existing redirect) in 100% of trials.
- **SC-007**: In a keyboard-only pass, a reviewer can open the profile menu and activate Logout without using a pointer.
- **SC-008**: Search remains editable without search API/navigation (local autocomplete stubs allowed); notification remains enabled with a no-op activate; no search/notification API calls or backend changes are required for acceptance.
- **SC-009**: Existing sidebar layout behavior remains unbroken under the topbar in 100% of side-by-side layout checks (sticky topbar + sidebar scroll coexistence without an unnecessary second scrollbar).
- **SC-010**: A reviewer can identify each icon-only control’s purpose from its accessible name/label/tooltip without relying on visual icon recognition alone.

## Assumptions

- The topbar is shown in the authenticated Shell layout; unauthenticated/login chrome is unchanged by this feature.
- The topbar spans the full viewport width; the sidebar sits underneath it beside content (confirmed 2026-09-15). Earlier content-column-only clarification is superseded.
- Brand/logo + product name live on the left of the topbar (confirmed 2026-09-15); the sidebar no longer owns a brand header.
- Topbar visual treatment uses the surface background; separation uses a bottom box-shadow (no bottom border) (confirmed post-implement 2026-09-10).
- Search and notifications are intentional UI placeholders for future features; the notification control is enabled/focusable but activating it is a no-op (confirmed 2026-09-10); search uses a dedicated shared autocomplete input with static stub options only (confirmed post-implement 2026-09-10).
- Theme Light/Dark already exists in the application; this feature only connects a topbar control to that mechanism. The toggle uses an action affordance for the theme the user will switch to (confirmed 2026-09-10). Icon buttons follow ERP-mapped Material tokens in both themes (confirmed 2026-09-15).
- Logout/authentication already exists from prior authentication work; this feature only connects the profile menu action to that mechanism and reuses any post-logout navigation it already provides.
- Displayed user name comes from existing/default application user context; no user profile API is required.
- Shared UI library components and curated utility styles are preferred over new one-off controls or duplicated utilities; search is `erp-search-input` in `@erp/ui`, not `erp-form-field`.
- Shell layout code continues the per-concern folder pattern under the Shell layout area (for example a dedicated topbar folder alongside existing layout concerns).
- Dedicated mobile/responsive topbar redesign is out of scope unless already covered by existing Shell conventions; efficient use of horizontal space on typical desktop widths is in scope.
- No backend, database, or API endpoint work is part of this feature.
