# Feature Specification: Internationalization Language Selector

**Feature Branch**: `006-i18n-language-selector`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Update the existing Internationalization (i18n) specification to include a compact language selector in the ERP Shell topbar. English and Arabic only. Selector placed immediately after the Theme button. Topbar/sidebar layout implementation is out of scope. Compact display uses flag + short code (🇬🇧 EN / 🇸🇦 AR). Angular Material only (no PrimeNG). Runtime language switch with LTR/RTL, persistence of `en`/`ar`, shared language state owned by libs/i18n, optional presentation component in libs/ui, Shell owns global selection, MFEs consume shared state, accessibility required. Do not implement search, notifications, profile, logout, theme, sidebar, topbar layout, business-module translations, or additional languages."

## Constitution Alignment

This feature establishes Shell-owned global language selection and shared internationalization language/direction state required for a bilingual (English / Arabic) ERP experience. It complements the existing Shell topbar (theme and other chrome controls) by defining the language selector integration only—not topbar or sidebar layout construction.

**Noted alignment adjustments (not conflicts):**

- Constitution assigns Shell ownership of application-level chrome (including topbar). This feature places the language selector in the topbar action cluster immediately after Theme; it does not redefine topbar/sidebar structure.
- Shared language state, translation application, persistence, and document direction belong in the shared i18n library (`libs/i18n`). Presentation-focused reusable UI belongs in the shared UI library (`libs/ui`) when a reusable selector is warranted.
- Angular Material is the primary UI component library; PrimeNG and other competing UI libraries MUST NOT be introduced.
- Signals are the default for Shell/shared presentation and language state; NgRx MUST NOT be introduced for language switching.
- Authentication, routing, theme switching, search, notifications, profile/logout, and business-module translation catalogs remain out of scope.

## Clarifications

### Session 2026-09-16

- Q: Which parts of the UI must actually switch between English and Arabic text in this feature for acceptance? → A: Shell chrome — topbar, sidebar navigation labels, and other Shell/shared chrome strings switch EN/AR; business MFE screens not translated yet
- Q: If Arabic (or English) translation resources fail to load when the user switches language, what should the application do? → A: Keep prior language/direction; show brief user-visible feedback; do not crash
- Q: Should the saved language preference be shared for everyone using this browser, or tied to the signed-in user account? → A: Browser/device-local only (like theme); same for any user on that browser
- Q: Should language restore and the language selector also apply on the login (unauthenticated) screen, or only in the authenticated Shell topbar? → A: Restore language/direction at startup for the whole app (including login); selector UI only in authenticated topbar
- Q: When Arabic is active, should the language control’s accessible name stay the English word “Language,” or be translated too? → A: Translate the accessible name with the active language

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch language from the Shell topbar (Priority: P1)

As an authenticated ERP user, I can open a compact language selector in the Shell topbar (immediately after the Theme control) and choose English or Arabic so the application language and reading direction update immediately without restarting the app.

**Why this priority**: Runtime language switching is the core user value of this feature; without it, bilingual support cannot be exercised from the Shell.

**Independent Test**: Open the authenticated Shell; confirm a language control appears after Theme; select EN then AR (and vice versa); confirm translations and document direction update at runtime without a full application restart.

**Acceptance Scenarios**:

1. **Given** the authenticated Shell topbar is visible, **When** the user inspects the right-side action cluster, **Then** a language selector appears immediately after the Theme control and before the Profile control (order: Search, Notification, Theme, Language, Profile).
2. **Given** the language selector is visible, **When** the user views the closed control, **Then** it shows the currently selected language as flag + short code only (🇬🇧 EN or 🇸🇦 AR), not a full language name.
3. **Given** the language selector is open, **When** the user reviews options, **Then** exactly two options appear: 🇬🇧 EN and 🇸🇦 AR (Arabic uses “AR”, never “ER”).
4. **Given** the user selects EN, **When** the selection is applied, **Then** the active language becomes English (`en`), Shell/shared chrome strings (topbar, sidebar navigation labels, and other Shell chrome) appear in English, and document/layout direction is LTR.
5. **Given** the user selects AR, **When** the selection is applied, **Then** the active language becomes Arabic (`ar`), Shell/shared chrome strings (topbar, sidebar navigation labels, and other Shell chrome) appear in Arabic, and document/layout direction is RTL.
6. **Given** either language is selected, **When** the change completes, **Then** the application continues running without requiring a full restart or reload solely to apply language/direction.

---

### User Story 2 - Persist and restore language preference (Priority: P1)

As an ERP user, my selected language is remembered across sessions so that on the next visit the application restores a valid saved language (or English if none/invalid) and applies the matching direction before I continue work.

**Why this priority**: Persistence makes language choice durable; without restore-on-startup, users must reselect language every session.

**Independent Test**: Select Arabic, fully restart/reload the application, and confirm Arabic + RTL are restored; clear or corrupt the saved preference and confirm English + LTR are used.

**Acceptance Scenarios**:

1. **Given** the user selects English or Arabic, **When** the preference is saved, **Then** the application persists the language identifier as `en` or `ar` in browser/device-local storage (not display labels such as “EN” or “AR”, unless an existing platform persistence contract already requires a different stored form—in which case mapping MUST still treat `en`/`ar` as the application language identifiers), and the preference is not bound to a specific user account.
2. **Given** a valid persisted language (`en` or `ar`) exists, **When** the application starts (including when the login screen is shown before authentication), **Then** that language is restored, in-scope translations for that language apply (including login strings when visible), and the matching document direction is applied.
3. **Given** no persisted language exists, or the stored value is invalid/unsupported, **When** the application starts, **Then** English (`en`) is used with LTR direction.
4. **Given** startup language restoration completes and the user is authenticated, **When** the user views the language selector, **Then** the closed control reflects the active language (🇬🇧 EN or 🇸🇦 AR).
5. **Given** the user is on the login/unauthenticated screen, **When** they look for a language selector control, **Then** this feature does not require a language selector there; language/direction still follow the restored (or default) preference.

---

### User Story 3 - Use one shared language state across Shell and microfrontends (Priority: P1)

As an ERP user working across business areas, when I change language in the Shell, every active microfrontend reflects the same language and direction without separate language selectors in Sales, Purchasing, Inventory, Finance, Master Data, Reports, or Administration.

**Why this priority**: A single global language experience is required for a coherent bilingual ERP; duplicate selectors would fragment state and UX.

**Independent Test**: Change language from the Shell selector; confirm active MFEs react to the shared language/direction state; confirm no per-MFE language selectors exist in the listed business modules.

**Acceptance Scenarios**:

1. **Given** the Shell language selector changes the active language, **When** any active microfrontend is visible, **Then** that microfrontend consumes the same shared language state and updates accordingly.
2. **Given** reviewers inspect business microfrontends, **When** they look for language-selection UI, **Then** Sales, Purchasing, Inventory, Finance, Master Data, Reports, and Administration do not provide their own language selectors.
3. **Given** language infrastructure and any reusable selector UI are reviewed, **When** ownership is checked, **Then** language state, translation loading, persistence, and direction management belong to the shared i18n library; presentation-focused reusable selector UI (if required) belongs to the shared UI library; selection logic is not duplicated per MFE.

---

### User Story 4 - Operate the selector accessibly in LTR and RTL (Priority: P2)

As a keyboard and assistive-technology user, I can discover, open, and change the language control in both English (LTR) and Arabic (RTL) layouts, with a clear accessible name that does not rely on the flag alone.

**Why this priority**: Accessibility and bidirectional correctness are required for inclusive bilingual use, but depend on the core switch/persist behaviors already working.

**Independent Test**: With keyboard only, open the selector and choose each language in both LTR and RTL; confirm an accessible name translated for the active language, that the selected language is announced clearly, and that flag+code remain visible together.

**Acceptance Scenarios**:

1. **Given** the language selector is present, **When** a keyboard-only user interacts with it, **Then** they can focus, open, and choose EN or AR without a pointer.
2. **Given** the language selector is present, **When** assistive technology inspects it, **Then** it has an accessible name translated for the active language (for example English “Language” and the Arabic equivalent when Arabic is active), clearly identifies the selected language, and does not rely on the flag alone.
3. **Given** English is active, **When** the user views application chrome direction, **Then** overall direction is LTR (sidebar on the left; topbar follows LTR), and the language selector still works.
4. **Given** Arabic is active, **When** the user views application chrome direction, **Then** overall direction is RTL (sidebar on the right; topbar follows RTL), and the language selector still works.
5. **Given** either direction, **When** reviewers inspect implementation approach, **Then** the same language selector experience is used for both languages (no separate English-only and Arabic-only selector components).

---

### Edge Cases

- What happens if persisted language is missing, empty, or not `en`/`ar`? Fall back to English (`en`) and LTR.
- What happens if the user re-selects the already active language? Remain on that language/direction; no harmful restart or error.
- What happens if translation resources for the selected language are temporarily unavailable? Keep the previously working language and direction; show brief user-visible feedback using existing application notification/feedback patterns; do not crash the Shell; do not invent a new global error system in this feature.
- What happens under RTL? Selector remains usable; visual compact form still shows flag + short code; mirror/layout follows document direction without a second component.
- What happens if display labels “EN”/“AR” appear in UI? They are presentation only; persisted/application identifiers remain `en`/`ar`.
- What happens regarding topbar/sidebar layout work? This feature does not redesign topbar or sidebar; it only defines the language selector and its placement/integration relative to the existing Theme control.
- What happens for additional languages? Unsupported—only English and Arabic are in scope.
- What happens on the login screen? Language and direction are restored from the browser/device preference (or default English); no language selector control is required on login in this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Shell MUST provide a compact language selector in the authenticated topbar action cluster, placed immediately after the Theme control and before the Profile control. The language selector UI MUST NOT be required on the login/unauthenticated screen in this feature.
- **FR-002**: Supported languages MUST be exactly English (`en`) and Arabic (`ar`). No additional languages MAY be introduced in this feature.
- **FR-003**: The closed selector MUST display the active language as flag + short code only: 🇬🇧 EN for English and 🇸🇦 AR for Arabic. Full language names MUST NOT be shown in the selector.
- **FR-004**: Dropdown/menu options MUST be exactly 🇬🇧 EN and 🇸🇦 AR. Arabic MUST use the short code “AR” (never “ER”). Flags MUST appear together with the short code and MUST NOT be the sole identifier.
- **FR-005**: Selecting English MUST set active language to `en`, apply English translations to Shell/shared chrome (topbar, sidebar navigation labels, other Shell chrome strings, and login strings when that screen is shown), and apply LTR document/layout direction (sidebar left; topbar LTR).
- **FR-006**: Selecting Arabic MUST set active language to `ar`, apply Arabic translations to Shell/shared chrome (topbar, sidebar navigation labels, other Shell chrome strings, and login strings when that screen is shown), and apply RTL document/layout direction (sidebar right; topbar RTL).
- **FR-006a**: Business microfrontend feature screens MUST NOT be required to ship full translation catalogs in this feature; visible MFE content MAY remain in its current language until a later translation effort.
- **FR-007**: Language changes MUST apply at runtime without requiring a full application restart.
- **FR-007a**: If translation resources for the newly selected language fail to load, the system MUST keep the previously working language and direction, MUST show brief user-visible feedback using existing application notification/feedback patterns, and MUST NOT crash the Shell.
- **FR-008**: The selected language MUST be persisted using the application’s existing client persistence approach as a **browser/device-local** preference (same class of storage as theme—not bound to a signed-in user account and not server-synced). Stored identifiers MUST be `en` or `ar` (not display values “EN”/“AR” unless an existing persistence contract forces a mapped form that still resolves to `en`/`ar`).
- **FR-009**: On application startup (including before authentication), the system MUST (1) restore a valid persisted language if present, (2) otherwise use English, (3) apply the correct language translations to in-scope surfaces present at that time (including login strings when the login screen is shown), and (4) apply the correct document direction.
- **FR-010**: Global language state, translation loading/application, persistence of language preference, and direction management MUST belong to the shared i18n library (`libs/i18n`).
- **FR-011**: The Shell topbar language selector MUST consume shared i18n state; it MUST NOT own a parallel language-store implementation.
- **FR-012**: If a reusable language selector presentation component is required, it MUST live in the shared UI library (`libs/ui`) and remain presentation-focused (no duplicated persistence, translation loading, or direction management).
- **FR-013**: The Shell MUST own global language selection UI. Business microfrontends (Sales, Purchasing, Inventory, Finance, Master Data, Reports, Administration) MUST NOT implement their own language selectors.
- **FR-014**: Active microfrontends MUST consume the same shared language state and react when language/direction changes.
- **FR-015**: Language switching state MUST use Signals where appropriate for shared/presentation state. NgRx MUST NOT be introduced for language switching.
- **FR-016**: The language selector MUST use the platform’s primary UI component library (Angular Material)—for example a compact select or menu control suitable for the topbar. PrimeNG and other competing UI component libraries MUST NOT be used.
- **FR-017**: The language selector MUST be keyboard accessible, expose an accessible name that is translated with the active language (for example English “Language” and the Arabic equivalent when Arabic is active), clearly identify the selected language to assistive technologies, and MUST NOT rely on the flag alone.
- **FR-018**: The same selector experience MUST work in both LTR and RTL; separate English-only and Arabic-only selector components MUST NOT be created.
- **FR-019**: This feature MUST NOT implement search, notifications, profile menu, logout, theme switching, sidebar structure, topbar layout construction, full business-module translation catalogs, or additional languages beyond English and Arabic. Sidebar/topbar chrome label translation is in scope; redesigning sidebar/topbar layout is not.
- **FR-020**: Existing authentication and routing behavior MUST remain unchanged by this feature.

### Key Entities *(include if feature involves data)*

- **Language Preference**: User-selected application language identifier (`en` | `ar`), persisted as a browser/device-local preference (not per-account / not server-synced) and restored at startup.
- **Active Language**: The currently applied language driving Shell/shared chrome translations (topbar, sidebar navigation labels, and other Shell chrome) and UI direction for Shell and consuming microfrontends’ shared language awareness.
- **Document Direction**: Layout/reading direction derived from active language (`ltr` for English, `rtl` for Arabic), including chrome expectations (sidebar side and topbar direction).
- **Language Option**: A selectable presentation pair of flag + short code (🇬🇧 EN, 🇸🇦 AR) mapped to an underlying language identifier.
- **Language Selector Control**: Compact topbar control showing the current option and listing EN/AR choices; owned by Shell consumption of shared i18n state (presentation may live in shared UI).
- **Shared Language State**: Application-wide language + direction state owned by the shared i18n library and consumed by Shell and MFEs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of topbar layout reviews, the language selector appears immediately after Theme and before Profile in the action cluster.
- **SC-002**: In 100% of visual checks, the closed control and options show only flag + short code (🇬🇧 EN / 🇸🇦 AR), with no full language names and with Arabic labeled “AR” (not “ER”).
- **SC-003**: Users can switch EN ↔ AR at runtime in under 2 seconds of perceived UI update for Shell chrome language (topbar/sidebar/shared chrome strings) and direction, without a full application restart, in 100% of successful switch trials.
- **SC-003a**: When translation resources for the selected language fail to load, the prior language and direction remain active, brief user-visible feedback appears, and the Shell remains usable in 100% of failure trials.
- **SC-004**: After selecting Arabic, a full reload/restart restores Arabic + RTL in 100% of trials with a valid saved preference (including on the login screen before authentication); with missing/invalid preference, English + LTR is used in 100% of trials. The language selector itself remains authenticated-topbar-only.
- **SC-005**: Selecting English results in LTR chrome (sidebar left, topbar LTR) and selecting Arabic results in RTL chrome (sidebar right, topbar RTL) in 100% of direction checks.
- **SC-006**: Reviewers confirm a single Shell language selector and no duplicate language selectors in Sales, Purchasing, Inventory, Finance, Master Data, Reports, or Administration.
- **SC-007**: In a keyboard-only pass, a reviewer can open the selector and choose each language in both LTR and RTL without a pointer.
- **SC-008**: In an accessibility review, the control has an accessible name translated for the active language (not a fixed English-only label), announces/identifies the selected language without relying on the flag alone, and passes in both directions.
- **SC-009**: Ownership review confirms language infrastructure lives in the shared i18n library and any reusable selector presentation lives in the shared UI library, with no duplicated language-selection logic across MFEs.
- **SC-010**: Authentication and routing behaviors remain unchanged in 100% of regression smoke checks for login, logout/session continuity (as already implemented), and existing route navigation.

## Assumptions

- No prior standalone i18n feature directory existed in `specs/`; this specification is the authoritative Internationalization feature focused on language-selector integration and the shared language/direction infrastructure it requires.
- The Shell topbar and Theme control already exist (or will exist from prior Shell chrome work); this feature integrates the language selector relative to Theme and does not redefine topbar/sidebar layout. Language/direction restore runs at application startup for the whole app (including login); the selector control itself is authenticated topbar only.
- Login screen copy that is part of the Shell auth entry experience is treated as an in-scope translation surface for startup restore; a login-page language selector is out of scope for this feature.
- Client-side persistence for preferences already exists in the platform pattern (similar to theme); language preference is browser/device-local for any user of that browser, not bound to a signed-in user account and not synced via a backend preference API.
- Baseline English and Arabic translation resources for Shell/shared chrome strings (including topbar, sidebar navigation labels, and login screen strings when shown) are in scope for acceptance; exhaustive business-module translation catalogs and translated MFE feature screens are out of scope for this feature.
- Microfrontends can observe shared language/direction state through the shared i18n library; federation wiring details are planning concerns, not separate product requirements here.
- Document direction changes are expected to reposition sidebar (left vs right) and flip topbar flow as part of RTL/LTR application chrome behavior already owned by Shell layout, triggered by i18n direction state—not by re-implementing sidebar/topbar in this feature.
- Angular Material (for example MatSelect or MatMenu) is the approved compact control family; exact control choice is a design/implementation detail as long as the compact topbar UX and accessibility requirements are met.
- “Existing authentication and routing remain unchanged” means this feature does not alter login, session, guards, or route tables beyond any incidental shared-library consumption required for language awareness.
