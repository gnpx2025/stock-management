# Data Model: Internationalization Language Selector

**Feature**: `006-i18n-language-selector` | **Date**: 2026-09-16

Client-side presentation and preference model only. No database or API schemas. Language preference is browser/device-local.

---

## Entities

### AppLanguage

Canonical application language identifier.

| Value | Meaning | Direction |
|-------|---------|-----------|
| `en` | English | `ltr` |
| `ar` | Arabic | `rtl` |

**Invariants**:
- Only `en` and `ar` are valid persisted/application identifiers.
- Display labels `EN` / `AR` are presentation only — never stored as the language id (unless an unexpected legacy mapping still resolves to `en`/`ar`).

### DocumentDirection

| Value | Derived from |
|-------|----------------|
| `ltr` | `en` |
| `rtl` | `ar` |

Applied to `document.documentElement.dir` (and `lang` to `en`/`ar`).

### LanguagePreference

| Field | Type | Rules |
|-------|------|--------|
| `language` | `AppLanguage` | Required after resolve |
| Storage key | `erp.language` | `localStorage` |
| Scope | Browser/device | Not per-user; not server-synced |
| Default | `en` | When missing/invalid/unreadable |

**Resolve algorithm**:
1. Read `localStorage['erp.language']`
2. If `en` or `ar` → use
3. Else → `en`
4. Apply catalogs + direction

### ActiveLanguageState

Runtime state owned by `@erp/i18n` `LanguageService`.

| Field | Type | Notes |
|-------|------|--------|
| `language` | Signal&lt;AppLanguage&gt; (readonly public) | Current locale id |
| `direction` | Signal&lt;DocumentDirection&gt; or derived | From language |
| `catalog` | Message map for active language | Shell chrome keys → strings |
| `ready` | boolean/signal (optional) | True after successful apply |

**Transitions**:
- `setLanguage(en)` → persist `en` → apply EN catalog → `dir=ltr` `lang=en`
- `setLanguage(ar)` → persist `ar` → apply AR catalog → `dir=rtl` `lang=ar`
- `setLanguage` fails (catalog load) → **no** language/direction change; toast feedback; prior state remains
- Re-select same language → no harmful restart; may no-op apply

### LanguageOption (presentation)

| Field | Type | Rules |
|-------|------|--------|
| `id` | `AppLanguage` | `en` \| `ar` |
| `flag` | string | 🇬🇧 or 🇸🇦 (with code; not sole identifier) |
| `code` | string | `EN` or `AR` (Arabic MUST be `AR`, never `ER`) |
| `display` | string | `${flag} ${code}` e.g. `🇬🇧 EN` |

Fixed set of exactly two options for this feature.

### LanguageSelectorControl

| Field | Source | Rules |
|-------|--------|--------|
| Host | Authenticated Shell topbar only | Not on login |
| Placement | After Theme, before Profile | Right action cluster |
| Closed display | Active `LanguageOption.display` | No full language names |
| Menu options | Both `LanguageOption`s | MatMenu items |
| Accessible name | Translated key | Changes with active language |
| Activate option | `LanguageService.setLanguage(id)` | Runtime; no full restart |

### TranslationCatalog

| Field | Type | Rules |
|-------|------|--------|
| Locale | `AppLanguage` | One catalog per locale |
| Entries | `Record<messageKey, string>` | Flat or nested keys as implemented |
| Scope (v1) | Shell chrome | Topbar, sidebar nav + a11y, login strings, language control labels |

**Message key domains (illustrative)**:
- `shell.topbar.*` — brand, search, notifications, theme, profile, logout
- `shell.nav.*` — section and item labels
- `shell.language.*` — selector accessible name and related
- `auth.login.*` — login form copy and mapped errors

### SharedLanguageConsumer (MFE contract entity)

| Field | Rules |
|-------|--------|
| Selector UI | MUST NOT exist in business MFEs for this feature |
| State source | MUST use `@erp/i18n` when consuming language |
| Reaction | When language Signal changes, translated UI bound to it updates |

---

## Relationships

```text
LanguagePreference (localStorage erp.language)
        ↓ restore/persist
ActiveLanguageState (LanguageService)
        ├──→ DocumentDirection (html dir/lang)
        ├──→ TranslationCatalog (active)
        └──→ LanguageSelectorControl (Shell topbar presentation)
                    ↑
            erp-language-selector (@erp/ui Inputs/Outputs)
```

---

## Persistence map

| Concern | Key / location | Owner |
|---------|----------------|-------|
| Language | `localStorage` `erp.language` | `@erp/i18n` |
| Theme (unchanged) | `localStorage` `erp.themeMode` | `@erp/ui` ThemeService |

---

## Validation rules

| Rule | Enforcement |
|------|-------------|
| Only `en`/`ar` | Reject/ignore other stored values; default `en` |
| Arabic code display | Always `AR` in UI |
| No full names in selector | Presentation contract |
| Auth/routing unchanged | No data-model coupling to session tokens |
