# @erp/i18n

Shared internationalization for the ERP platform.

## Ownership

- **Language state, catalogs, persistence (`erp.language`), and document direction** live here.
- **Presentation** (e.g. `erp-language-selector`) lives in `@erp/ui` and must not import this library for state ownership inverted the wrong way — apps wire Inputs/Outputs to `LanguageService`.
- The **Shell** owns the global language selection UI (authenticated topbar).

## Microfrontends

Business remotes (Sales, Purchasing, Inventory, Finance, Master Data, Reports, Administration):

- MUST consume `@erp/i18n` as a shared singleton when they need language/direction.
- MUST NOT implement their own language selectors.
- MAY leave feature screens untranslated until a later catalog effort; they should still respect `document.dir` / `LanguageService` when integrating.

## Usage

```ts
import { LanguageService, provideErpI18n, TranslatePipe } from '@erp/i18n';

// app.config.ts
providers: [provideErpI18n(), /* … */]

// templates
{{ 'shell.topbar.brandTitle' | erpTranslate }}
```
