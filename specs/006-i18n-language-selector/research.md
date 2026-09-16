# Research: Internationalization Language Selector

**Feature**: `006-i18n-language-selector` | **Date**: 2026-09-16

All Technical Context unknowns resolved against the current Shell, `@erp/ui`, `@erp/core`, and constitution. Clarifications from 2026-09-16 applied.

---

## 1. Library ownership (`libs/i18n`)

**Decision**: Create a new Nx Angular library `frontend/libs/i18n` with path alias `@erp/i18n`. It owns:

- Active language Signal (`en` | `ar`)
- Persistence restore/save
- Document `lang` / `dir` application
- Translation catalog loading and lookup
- `provideErpI18n()` for Shell `app.config.ts`

Export public API from `libs/i18n/src/index.ts`. Add tags consistent with other shared libs (`type:i18n`, `scope:shared`).

**Rationale**: Spec FR-010; constitution shared-lib ownership; no existing i18n lib (greenfield).

**Alternatives considered**:
- Put LanguageService in `@erp/ui` beside ThemeService — rejected (spec assigns language infrastructure to `libs/i18n`; UI stays presentation).
- Put in `@erp/core` — rejected (core is auth/HTTP/config; i18n is a distinct cross-cutting concern named by spec).

---

## 2. Runtime translation strategy (no ngx-translate)

**Decision**: Implement a lightweight **Signals-based** dictionary service in `@erp/i18n`:

- JSON (or TS) catalogs per locale for Shell chrome keys
- `t(key)` / `translate` pipe or computed helper for templates
- `setLanguage(lang)` loads/applies catalog, updates Signal, persists, applies direction
- Eagerly load both small Shell catalogs (or load on demand with failure handling)

Do **not** use Angular build-time `@angular/localize` as the primary runtime switch mechanism (requires locale builds / reload). Do **not** add `@ngx-translate/core` for this feature’s small Shell chrome surface.

**Rationale**: Spec requires runtime switch without restart + Signals + no NgRx; Shell chrome catalog size is modest (nav + topbar + login); avoids new third-party UI/i18n stack risk.

**Alternatives considered**:
- `@ngx-translate/core` — viable later for large catalogs; unnecessary dependency for v1 Shell chrome.
- Build-time `@angular/localize` only — rejected (full reload / multi-build; conflicts with FR-007).
- Per-component hardcoded if/else strings — rejected (not shared; duplicates MFE risk).

---

## 3. Persistence (mirror ThemeService)

**Decision**: Persist language id in `localStorage` key **`erp.language`** with values `en` | `ar` only.

Algorithm (align with `ThemeService`):

1. On construct / provide: read storage; if `en`|`ar` → use; else → `en`
2. Apply language + `document.documentElement.lang` + `dir`
3. On `setLanguage`: validate → update Signal → persist → apply translations + direction
4. Ignore storage exceptions (private mode)

Not bound to user account; not server-synced (clarification).

**Rationale**: Clarification Q3; FR-008; existing `erp.themeMode` pattern in `libs/ui/.../theme.service.ts`.

**Alternatives considered**: Per-user localStorage key — rejected by clarification. Server preference API — out of scope.

---

## 4. Translation surface (Shell chrome)

**Decision**: Translate in this feature:

| Surface | Approach |
|---------|----------|
| Sidebar section/item labels | Replace hardcoded English in `shell-nav-menu.data.ts` with message keys; resolve via `@erp/i18n` in sidebar template/component |
| Sidebar a11y labels | Translate (“Application navigation”, “Main menu”, etc.) |
| Topbar chrome strings | Brand title, Search placeholder/aria, Notifications, Theme aria, Profile/Logout, language selector aria |
| Login page | Labels, validation, buttons, mapped auth error strings — **no** language selector on login |
| Business MFEs | Out of scope — may remain English; must still observe shared language/direction when they later consume `@erp/i18n` |

**Rationale**: Clarification Q1 + Q4; FR-005/006/006a/019.

**Alternatives considered**: Minimal demo strings only — rejected (clarification chose Shell chrome). Full MFE catalogs — out of scope.

---

## 5. Language selector UI (`MatMenu` + `@erp/ui`)

**Decision**:

- Presentation component **`erp-language-selector`** in `libs/ui` (Inputs: `language`, optional `options`; Output: `languageChange`; translated `ariaLabel` input).
- Implement with **Angular Material `MatMenu`** triggered by a compact button showing `🇬🇧 EN` / `🇸🇦 AR` (and menu items the same). Match profile menu pattern already in topbar.
- Shell topbar injects `LanguageService`, binds Inputs/Outputs; does not embed language logic in the presentation component.
- **Do not** use `MatSelect` / form-field chrome (heavier, less aligned with icon-action cluster).
- **Do not** use PrimeNG.

**Rationale**: Spec FR-012/016; compact topbar; profile already uses MatMenu; avoid `ui` → `i18n` dependency.

**Alternatives considered**:
- MatSelect — rejected for topbar density / form-field affordance.
- Shell-only MatMenu without `@erp/ui` component — acceptable YAGNI, but shared presentation matches FR-012 and future reuse.
- Flags only — rejected (FR-004; a11y).

---

## 6. Topbar placement

**Decision**: Insert language selector in `shell-topbar.html` actions cluster **immediately after Theme and before Profile**:

`Notification → Theme → Language → Profile`

Do not redesign topbar layout, search, notifications, theme, or profile (FR-019).

**Rationale**: Spec FR-001; SC-001; updates 005 right-cluster order for this feature.

**Alternatives considered**: Before Theme — rejected by spec. Inside Profile menu — rejected by spec.

---

## 7. Startup restore vs selector visibility

**Decision**:

- Call `provideErpI18n()` from Shell `app.config.ts` so language restores **before/at** first authenticated or login view (app-wide `lang`/`dir` + catalogs).
- Render `erp-language-selector` **only** in authenticated `ShellTopbarComponent` (login has no topbar today — keep it that way).
- Login strings consume translations when login is shown.

**Rationale**: Clarification Q4; FR-001/009.

**Alternatives considered**: Selector on login — deferred/out of scope. No restore until auth — rejected (clarification).

---

## 8. Translation load failure

**Decision**: On failed catalog load/switch:

1. Keep previous `language` Signal and document direction unchanged
2. Show brief toast via existing `NOTIFICATION_HANDLER` / `ToastNotificationService` (MatSnackBar)
3. Do not crash; do not invent a new global error system

For v1 with bundled catalogs, failure is rare (missing key file / future HTTP load); still implement the contract for FR-007a.

**Rationale**: Clarification Q2; existing toast pattern in `@erp/ui`.

**Alternatives considered**: Silent keep — weaker UX. Fall back to English always — rejected by clarification.

---

## 9. RTL / LTR and sidebar side

**Decision**:

- English → `document.documentElement.dir = 'ltr'`, `lang = 'en'`
- Arabic → `dir = 'rtl'`, `lang = 'ar'`
- Rely on document direction so existing flex Shell (`shell__main` row: sidebar + body) places sidebar on the **right** under RTL without a second sidebar component
- Optionally sync Angular CDK `Directionality` if Material overlays need it (MatMenu); prefer setting `dir` on `document.documentElement` which Material/CDK typically observe
- One language selector component for both locales

**Rationale**: FR-005/006/018; current layout is flex-based (not MatSidenav position API).

**Alternatives considered**: Duplicate Arabic layout components — rejected. Manual `row-reverse` class only without `dir` — weaker for text/forms/overlays.

---

## 10. MFE consumption (future-ready, no selectors)

**Decision**:

- Export `LanguageService` (readonly `language`, `direction`, `t`/`translate`) from `@erp/i18n`
- Document that remotes MUST import `@erp/i18n` as a **shared singleton** when they appear (Native Federation `shareAll` already shares packages; ensure path/package sharing strategy for workspace lib is documented in contracts)
- Do **not** add language selectors to Sales/Purchasing/Inventory/Finance/Master Data/Reports/Administration
- This feature does not require shipping remotes; Shell-only validation is sufficient for acceptance of shared-state design

**Rationale**: FR-013/014; SC-006/009.

**Alternatives considered**: Event bus across MFEs without shared lib — rejected (duplicate state). Per-MFE selectors — rejected by spec.

---

## 11. Types in `@erp/contracts`

**Decision**: Add `AppLanguage = 'en' | 'ar'` and optional `LanguageOption` / `DocumentDirection = 'ltr' | 'rtl'` in `libs/contracts` (parallel to `ThemeMode`), consumed by `@erp/i18n` and UI presentation types.

**Rationale**: Existing theme type pattern; avoid circular deps.

**Alternatives considered**: Types only inside `@erp/i18n` — acceptable but less consistent with theme.

---

## 12. Accessible name

**Decision**: Accessible name for the selector is a **translated** string key (e.g. `shell.language.label`) resolving to English “Language” / Arabic equivalent. Selected language announced via flag+code text, not flag alone.

**Rationale**: Clarification Q5; FR-017; SC-008.

**Alternatives considered**: Fixed English “Language” — rejected. Locale-neutral “EN/AR” only — weaker clarity.

---

## Resolved NEEDS CLARIFICATION

None remain in Technical Context after research.
