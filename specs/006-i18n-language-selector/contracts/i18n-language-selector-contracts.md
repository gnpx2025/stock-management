# Contracts: Internationalization Language Selector

**Feature**: `006-i18n-language-selector` | **Date**: 2026-09-16  
**Audience**: Shell / shared-lib implementers and reviewers  
**Scope**: UI structure, shared library API, and behavior contracts (no HTTP preference APIs)

---

## 1. Library API contract (`@erp/i18n`)

| Export | Contract |
|--------|----------|
| `LanguageService` | `providedIn: 'root'` (or provided via `provideErpI18n`) |
| `language` | Readonly Signal&lt;`'en' \| 'ar'`&gt; |
| `direction` | Readonly Signal or derived `'ltr' \| 'rtl'` |
| `setLanguage(lang)` | Validates; loads/applies catalog; persists; sets `html[lang]` + `html[dir]`; on failure keeps prior state + notifies |
| `t(key)` / translate pipe | Resolves active catalog string; stable fallback behavior for missing keys (document in impl; MUST NOT crash) |
| `provideErpI18n()` | Registers providers / initializer so language restores at app startup |

| Forbidden | |
|-----------|--|
| NgRx store for language | MUST NOT |
| Second parallel language store in Shell or MFEs | MUST NOT |
| Persisting `EN`/`AR` display codes as language id | MUST NOT (use `en`/`ar`) |

### Persistence

| Requirement | Contract |
|-------------|----------|
| Key | `erp.language` |
| Values | `en` \| `ar` |
| Scope | Browser/device `localStorage` |
| Invalid/missing | Default `en` + `ltr` |

### Direction

| Language | `lang` | `dir` | Chrome expectation |
|----------|--------|-------|--------------------|
| `en` | `en` | `ltr` | Sidebar left; topbar LTR |
| `ar` | `ar` | `rtl` | Sidebar right; topbar RTL |

---

## 2. Presentation contract (`@erp/ui` `erp-language-selector`)

| Requirement | Contract |
|-------------|----------|
| Role | Presentation only |
| Inputs | Active language id; accessible label string; optional options list |
| Outputs | Language change request (`en` \| `ar`) |
| Visual closed | Flag + short code only (`🇬🇧 EN` / `🇸🇦 AR`) |
| Options | Exactly those two; Arabic code `AR` never `ER` |
| Component family | Angular Material `MatMenu` (or equivalent compact Material menu) |
| Forbidden | PrimeNG; owning persistence; loading catalogs; setting document direction |

Dependency rule: `@erp/ui` MUST NOT import `@erp/i18n`. Shell (or other app shell) wires service ↔ presentation.

---

## 3. Shell topbar integration contract

| Requirement | Contract |
|-------------|----------|
| Host | Authenticated `ShellTopbarComponent` only |
| Order (L→R actions) | Notification → Theme → **Language** → Profile |
| Placement | Immediately after Theme control |
| Wiring | Bind `LanguageService` to `erp-language-selector` |
| Out of scope | Redesigning topbar layout; search/notification/theme/profile behavior changes |

---

## 4. Translation surface contract

| In scope | Out of scope |
|----------|--------------|
| Topbar chrome strings | Business MFE feature catalogs |
| Sidebar nav labels + nav a11y strings | Additional languages beyond `en`/`ar` |
| Login page strings (no selector) | Topbar/sidebar layout redesign |
| Language selector accessible name (translated) | Theme / auth / routing redesign |

---

## 5. Login / startup contract

| Requirement | Contract |
|-------------|----------|
| Startup | Restore language + direction for whole app before/at first paint of login or shell |
| Login selector | MUST NOT add language selector on login in this feature |
| Login copy | MUST use active language catalogs when login is shown |

---

## 6. Failure contract

| Event | Required behavior |
|-------|-------------------|
| Catalog load/switch failure | Keep prior language + direction |
| User feedback | Brief toast via existing notification handler / MatSnackBar |
| Stability | Shell remains usable; no crash; no new global error framework |

---

## 7. MFE contract

| Requirement | Contract |
|-------------|----------|
| Global selection owner | Shell only |
| Shared state | `@erp/i18n` singleton |
| Business MFEs | MUST NOT implement language selectors (Sales, Purchasing, Inventory, Finance, Master Data, Reports, Administration) |
| Reaction | When an MFE consumes `@erp/i18n`, it MUST react to language/direction changes |
| This feature’s acceptance | Shell chrome + shared lib sufficient; remotes need not ship translations yet |

---

## 8. Types contract (`@erp/contracts`)

| Type | Values |
|------|--------|
| `AppLanguage` | `'en' \| 'ar'` |
| `DocumentDirection` | `'ltr' \| 'rtl'` |

Optional shared `LanguageOption` shape for presentation lists.

---

## 9. Accessibility contract

| Requirement | Contract |
|-------------|----------|
| Keyboard | Open menu and choose EN/AR without pointer |
| Accessible name | Translated with active language (not English-only; not flag-only) |
| Selected language | Identifiable from text code + name semantics |
| Both directions | Same component works in LTR and RTL |

---

## 10. Unchanged behavior

| Area | Contract |
|------|----------|
| Authentication | Unchanged flows |
| Routing | Unchanged route tables/guards beyond incidental i18n consumption |
| Theme | Existing `ThemeService` unchanged except coexistence in topbar |
| Backend | No preference API |

---

## Traceability (spec ↔ contract)

| Spec | Contract section |
|------|------------------|
| FR-001, SC-001 | §3 Topbar integration |
| FR-002–004, SC-002 | §2 Presentation |
| FR-005–007, SC-003/005 | §1 Direction + setLanguage |
| FR-007a, SC-003a | §6 Failure |
| FR-008–009, SC-004 | §1 Persistence + §5 Startup |
| FR-010–015, SC-006/009 | §1 / §7 |
| FR-016–018, SC-007/008 | §2 / §9 |
| FR-019–020, SC-010 | §4 / §10 |
