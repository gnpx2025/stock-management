<!--
Sync Impact Report
- Version change: 3.0.0 → 3.0.1
- Modified principles / sections:
  - III. Frontend and Micro-Frontend Boundaries → shared library ownership
    now includes libs/i18n (@erp/i18n) for catalogs, LanguageService, and
    TranslatePipe; stack diagram note clarified that Shared libraries include
    core / ui / contracts / i18n / shared
- Added sections: none
- Removed / retired rules: none
- Follow-up TODOs: none
-->

# ERP Platform Constitution

## Core Principles

### I. Purpose and Correctness First

The ERP is a modular business application covering Master Data, Sales,
Purchasing, Inventory, Accounting and Finance, Payments and Receipts,
Reporting, Administration, and Audit and Security.

The system MUST prioritize correctness, maintainability, scalability,
security, auditability, and business transaction integrity over
unnecessary complexity.

Every business capability MUST preserve this relationship:

```text
Master Data → Business Document → Business Transaction
  → Inventory / Financial Effect → Audit Trail
```

### II. Defined Architecture Stack

The platform MUST use:

* Angular frontend with micro-frontend architecture
* Nx as the frontend monorepo and workspace management solution
* Angular Native Federation for micro-frontends
* A Shell application for application-level concerns
* Angular Material as the primary UI component library
* A shared UI library (`libs/ui`) as the common UI foundation across
  micro-frontends
* SCSS for application-specific styling
* .NET 10 with ASP.NET Core Web API for the backend
* Modular Monolith architecture for the backend initially
* Clean Architecture principles for backend organization
* PostgreSQL as the primary relational database
* Entity Framework Core as the primary ORM

The standard frontend UI architecture MUST be:

```text
Angular + Angular Material + shared UI library (libs/ui) + SCSS
```

The frontend architecture stack MUST remain:

```text
Angular 21+
    ↓
Nx Monorepo
    ↓
Native Federation Microfrontends
    ↓
Shared Core / UI / Contracts / i18n / Shared libraries
```

The backend architecture stack MUST remain:

```text
.NET 10
    ↓
ASP.NET Core
    ↓
Clean Architecture
    ↓
Modular Monolith
    ↓
PostgreSQL
```

A change to the frontend UI component library MUST NOT alter the backend
architecture.

The system MUST NOT be split into backend microservices unless a future
requirement provides clear business or technical justification.

Business domains MUST remain independently organized within the modular
monolith.

### III. Frontend and Micro-Frontend Boundaries

The frontend MUST use Angular 21+, strict TypeScript, standalone APIs,
Signals, RxJS, Signal Forms where appropriate, SCSS, Nx, Native
Federation, and Angular Material as the primary UI component library.
Organization MUST follow business capabilities with clear dependency
boundaries.

Shared library ownership MUST follow:

* `libs/ui` — Angular Material usage, reusable ERP UI components, and
  shared UI styles
* `libs/contracts` — shared contracts across micro-frontends
* `libs/core` — core cross-cutting functionality
* `libs/i18n` — language catalogs, `LanguageService`, translation pipe, and
  document direction (RTL/LTR)
* `libs/shared` — pure non-UI helpers

Micro-frontends MUST NOT directly import UI components or services from
another micro-frontend.

The Shell MUST own application-level functionality: authentication entry,
layout, sidebar / sidenav, topbar / toolbar, global navigation,
user/company/branch/financial year/accounting period/global permissions
context, global theme, global loading foundation, global notification
foundation, application-level layout state, and global error handling.
The Shell MUST use Angular Material for standard Shell UI where
appropriate (including MatSidenav, MatToolbar, MatIcon, MatButton,
MatMenu, MatTooltip, MatDivider, MatExpansionPanel, MatList, MatBadge,
MatProgressSpinner, and other Material/CDK components as needed). The
Shell MUST NOT contain feature-specific business UI.

Business micro-frontends MUST NOT implement their own independent
application shell or authentication mechanism unless explicitly required
by architecture. Each business area MUST be independently deployable
where practical.

Initial micro-frontends MAY include: Shell, Master Data, Finance,
Inventory, Purchasing, Sales, and Reporting.

A micro-frontend MUST NOT depend on another micro-frontend's internal
implementation. Shared functionality MUST be exposed through stable
shared contracts, shared libraries, application context, or backend APIs.
Micro-frontends MUST remain loosely coupled. The backend MUST remain the
authoritative source of business data and business rules.

All Angular micro-frontends MUST use the same Angular Material design
system. Typography, spacing, colors, component appearance, form
controls, buttons, tables, dialogs, menus, navigation, validation
states, error states, and loading states MUST remain consistent across
MFEs. Individual micro-frontends MUST NOT introduce an alternative UI
component library or an independent visual design system. Competing
libraries such as PrimeNG, NG-ZORRO, Bootstrap UI components,
TailwindCSS, Material UI for React, or other third-party UI component
frameworks MUST NOT be used. Angular CDK utilities MAY be used where
appropriate because Angular CDK is part of the Angular Material
ecosystem. The shared UI library (`libs/ui`) MUST be the common UI
foundation for all micro-frontends. Angular Material is shared
infrastructure: the Shell and all MFEs MUST use the same Angular
Material theme and design standards. Separate Material themes per MFE
MUST NOT be created unless explicitly required for a genuine isolated
use case. Duplicate Angular Material configuration MUST be avoided.

### IV. Backend Clean Architecture and Domain Ownership

The backend MUST follow Clean Architecture with primary layers:

```text
ERP.Api → ERP.Application → ERP.Domain ← ERP.Infrastructure
```

Dependency direction MUST be controlled. The Domain layer MUST NOT depend
on ASP.NET Core, Entity Framework Core, PostgreSQL, Infrastructure
implementations, or external frameworks that introduce unnecessary
coupling.

Business rules MUST NOT be implemented directly inside controllers.
Controllers MUST remain thin and delegate to application services/use
cases. The backend MUST follow SOLID principles and favor composition
over unnecessary inheritance.

The backend MUST be organized around business domains. Initial domains:

```text
Identity, Organization, MasterData, Finance, Inventory,
Purchasing, Sales, Reporting, Audit
```

Each domain MUST own its business rules and behavior. Business modules
MUST NOT duplicate the same business concept unnecessarily. A shared
entity MUST have a clear owner (for example: Customer → MasterData,
Sales Invoice → Sales, Receivable → Finance, Stock Movement → Inventory).

Master Data MUST own definitions of shared entities; business domains
MUST own behavior and transactions involving those entities.

### V. Security, Authorization, and Data Isolation

The platform MUST implement secure authentication and authorization.

Authentication MUST support user authentication, secure session/token
handling, access tokens, refresh tokens where appropriate, logout, and
session expiration.

Authorization MUST support roles, permissions, role-permission
relationships, user-role relationships, and granular business
permissions. Permissions MUST be action-oriented where appropriate
(for example: `sales.invoice.view`, `sales.invoice.post`,
`purchase.order.approve`, `finance.journal.create`).

Frontend permission checks MUST only control user experience. The
backend MUST always enforce authorization.

The architecture MUST support organizational data isolation. Business
data MUST be associated with appropriate organizational context where
required. The backend MUST enforce company and branch access. A user
MUST never access another company's data by modifying an ID in an API
request. Authorization and data isolation MUST be enforced server-side.

The backend MUST independently validate organizational context and MUST
NOT blindly trust company, branch, financial year, or accounting period
values supplied by the client.

Secrets MUST NOT be committed to source control. Database credentials,
JWT secrets, API keys, and other sensitive values MUST be managed through
environment or secret-management mechanisms.

### VI. Accounting, Inventory, and Document Integrity

Accounting MUST follow double-entry bookkeeping. Every posted journal
entry MUST satisfy Total Debit = Total Credit.

Financial Year and Accounting Period MUST be first-class business
concepts. The system MUST support period closing. Closed accounting
periods MUST prevent unauthorized modification. Posted accounting
transactions MUST be treated as immutable historical records.
Corrections MUST use reversal or adjustment mechanisms rather than
silently modifying historical accounting records.

Sales, Purchasing, Inventory, Payments, and Receipts MUST integrate with
Finance through clearly defined business rules.

Inventory MUST be based on traceable stock movements. The system MUST
maintain inventory transaction history. Current stock balance MUST NOT be
treated as the only source of truth. Inventory movements MUST identify,
where applicable: item, warehouse, quantity, unit, transaction type,
transaction date, source document, cost, and user. Inventory changes MUST
be traceable to their originating business transaction whenever
applicable.

Business documents MUST use a consistent lifecycle where applicable
(for example: Draft → Submitted → Approved → Posted → Closed, with
Rejected/Cancelled/Reversed where appropriate). Document state
transitions MUST be governed by business rules and permissions. Posted
documents MUST NOT be freely editable.

Document numbering MUST be centralized, configurable, and safe for
concurrent transactions without producing duplicates. Numbers MUST
support, where required: document type, company, branch, financial year,
prefix, sequence, and configurable format.

### VII. Auditability and Transaction Integrity

Important business and security operations MUST be auditable. Audit
records SHOULD capture user, timestamp, entity, entity ID, action,
company, branch, relevant before/after values, and source information
where appropriate. Audit records MUST be protected from unauthorized
modification.

Important auditable operations include authentication events, permission
changes, master data changes, document creation, approval, posting,
cancellation, reversal, financial transactions, and stock adjustments.

Business operations that modify multiple related records MUST use
appropriate transactional boundaries and MUST preserve data consistency.
Operations that must succeed or fail together MUST be handled atomically
(for example: posting a Sales Invoice coordinating invoice, receivable,
inventory movement, COGS, tax, and journal entry).

### VIII. API, Database, and Validation Standards

The backend MUST expose RESTful APIs that use consistent resource naming,
appropriate HTTP methods and status codes, request validation, DTOs where
appropriate, pagination for large collections, filtering and sorting
where appropriate, and API versioning. APIs MUST NOT expose persistence
entities directly. Initial API structure MUST follow `/api/v1/...`. API
contracts MUST remain stable and versioned when breaking changes are
required.

PostgreSQL MUST be the primary database. Design MUST prioritize
referential integrity, foreign keys, appropriate indexes, unique
constraints, check constraints where appropriate, transaction integrity,
and data consistency. Entity Framework Core migrations MUST be used for
schema evolution. Database-specific functionality MUST remain within the
Infrastructure layer. Soft deletion MUST only be used where it makes
business sense. Historical financial and transactional data MUST NOT be
physically deleted merely for convenience.

Validation MUST occur at appropriate boundaries. Frontend validation MUST
provide immediate user feedback. Backend validation MUST remain
authoritative. Business rules MUST NOT rely exclusively on frontend
validation. Critical rules (accounting period status, permissions, stock
availability, duplicate numbers, financial balance, organizational
access) MUST be validated server-side.

### IX. Quality, Testing, and Observability

The platform MUST support unit tests, integration tests, architecture
tests, and end-to-end tests. Unit tests MUST focus on business logic.
Integration tests MUST validate API, database, and infrastructure
interactions. Architecture tests SHOULD validate important dependency
boundaries. End-to-end tests MUST cover critical business workflows.
Critical financial and inventory rules MUST have automated test coverage.

Code MUST prioritize readability, maintainability, cohesion, loose
coupling, testability, and explicit business rules. The project MUST use
appropriate linting and formatting standards. The platform MUST avoid
unnecessary abstractions (including unnecessary wrappers around Angular
Material components), premature optimization, duplicate business logic,
god classes/services, excessive inheritance, global mutable state, tight
coupling between micro-frontends, and unapproved competing UI component
libraries. Reusable abstractions MUST be introduced only when there is a
clear repeated requirement.

The platform MUST provide sufficient logging and health monitoring to
diagnose issues. The backend MUST provide health checks for critical
dependencies. Logs MUST contain useful diagnostic information without
exposing passwords, access tokens, refresh tokens, sensitive personal
information, or secrets.

### X. Spec-Driven Incremental Development

The project MUST follow Spec-Driven Development. The standard lifecycle
MUST be:

```text
Constitution → Specification → Clarification → Plan → Tasks
  → Analysis → Implementation → Testing → Review
```

Each significant feature MUST be implemented as an independently
understood feature. Features MUST be completed and validated before
moving to the next major feature. The project MUST NOT implement the
entire ERP in a single generation or implementation step.

Development MUST proceed incrementally. The initial implementation order
SHOULD be:

```text
Platform Foundation → Authentication / Login
  → Organization & Application Context → Users / Roles / Permissions
  → Master Data → Audit / Document Numbering → Finance → Inventory
  → Purchasing → Sales → Payments / Receipts → Reporting
```

Each feature MUST build on previously completed and validated
foundations. Future features MUST NOT be implemented prematurely when
their dependencies have not yet been established.

## Technology and Platform Constraints

### Frontend UI Architecture (Angular Material-First)

The standard frontend UI architecture MUST be Angular + Angular Material
+ shared UI library (`libs/ui`) + SCSS.

Angular Material MUST be the primary UI component library and an approved
first-class frontend dependency. Official Angular Material components,
APIs, theming, styling capabilities, and Angular Material icons MUST be
used where appropriate. Angular Material MUST be the default choice for
standard UI needs wherever a suitable Material component exists,
including buttons, inputs, forms, selects, checkboxes, radio buttons,
tables, menus, sidenav, toolbar, cards, dialogs, drawers, tabs,
expansion panels, accordions, tooltips, icons, progress indicators,
snackbars, paginator, date pickers, chips, autocomplete, lists,
dividers, navigation components, and other standard UI requirements.
Angular Material components MUST be used directly wherever suitable.
The platform MUST NOT create unnecessary wrapper components around
Angular Material components. Angular CDK utilities MAY be used where
appropriate.

The project MUST maintain a dedicated shared UI library at `libs/ui`.
That library MUST contain reusable UI components and shared UI-related
styles used across the ERP application. Angular Material components and
reusable ERP-specific UI components MUST be centralized and exposed
through `libs/ui` according to the project's architecture. The UI library
MUST provide a consistent visual language and reusable UI patterns
across all micro-frontends.

Use Angular Material directly when a wrapper does not provide meaningful
reuse, abstraction, styling, or ERP-specific behavior. A custom reusable
component in `libs/ui` MUST be created only when:

1. Angular Material does not provide the required functionality, OR
2. The application needs consistent ERP-specific behavior/appearance
   across multiple features, OR
3. A reusable composition of multiple Angular Material components
   provides meaningful value.

Before creating a custom UI component, developers MUST verify whether
Angular Material already provides a suitable component. The shared UI
library MUST prevent duplicated UI implementations across MFEs.
Developers MUST use Angular Material consistently rather than choosing
arbitrary UI libraries or ad-hoc component implementations.

Custom reusable components MUST be implemented inside `libs/ui` when they
are reusable across applications. Custom components MUST follow Angular
21+, strict TypeScript, standalone components, Signals, accessibility,
and SCSS standards defined by this constitution.

Component styles and shared UI styles MUST remain within `libs/ui`.
SCSS MUST be used for application-specific styling. Angular Material
theming MUST be configured and standardized centrally. Theme
configuration MUST cover primary color, secondary/accent color where
applicable, typography, density, light/dark theme, component appearance,
common spacing, border radius, elevation, and other global design
tokens. Feature modules and individual micro-frontends MUST NOT
duplicate Angular Material theme definitions, overrides, or common UI
styles, and MUST NOT independently redefine common UI component styles.
Arbitrary hardcoded styling MUST be avoided when an Angular Material
theme/token or shared SCSS variable can be used. Application-specific
layout styles MAY exist within feature components; reusable UI styles
MUST belong in `libs/ui`.

Business feature modules MUST consume `libs/ui` and approved Angular
Material functionality rather than introducing their own UI technology.
Other third-party UI component libraries MUST NOT be introduced. The
frontend MUST NOT use PrimeNG, NG-ZORRO, Bootstrap UI components,
TailwindCSS, Material UI for React, or other competing component
libraries.

Angular Material accessibility capabilities MUST be used wherever
possible. Navigation and UI controls MUST provide keyboard
accessibility, appropriate ARIA semantics, visible focus states,
accessible labels/tooltips where required, sufficient contrast, and
screen-reader-friendly navigation.

### State Management

State management MUST follow a layered approach. Signals MUST be the
default for component state, local UI state, feature state, and derived
state. Signals MUST be used by default for Shell presentation state such
as sidebar expanded/collapsed state, navigation UI state, theme UI state
where appropriate, and other Shell-level presentation state. RxJS MUST
be used where reactive streams and asynchronous event processing are
appropriate. NgRx MUST NOT be introduced for simple Shell UI state. NgRx
MUST only be introduced when application state is genuinely shared,
complex, or requires predictable centralized state management.

Global state MUST be limited to genuinely application-wide information
(authentication, current user, permissions, company, branch, financial
year, accounting period, and other approved application context). Master
data and transactional server data MUST NOT automatically be placed into
global state merely because multiple modules can access them. The
platform MUST avoid a single global store containing all business-module
state.

### Error Handling, Loading, and Feedback

The application MUST provide centralized error handling. The backend MUST
return consistent error responses. The frontend MUST provide centralized
handling for authentication, authorization, validation, business rule,
unexpected server, and network errors. Business modules MUST NOT
implement unrelated global error-handling mechanisms independently.

The Shell MUST provide global loading capabilities for application-level
operations. Feature-specific loading MUST remain within the feature when
appropriate. Loading indicators MUST NOT block the entire application
unnecessarily. User-facing errors and successful operations SHOULD
provide consistent notifications.

### Configuration, Attachments, and Import/Export

Configuration MUST be environment-specific and MUST support at least
Development, Testing, Staging, and Production.

The platform SHOULD provide a reusable attachment capability for business
documents. File storage implementation MUST remain abstracted from
business modules.

The platform SHOULD support reusable import/export capabilities for large
master-data operations. Imports MUST validate data before committing
business records. Large imports MUST NOT bypass normal business
validation and security rules.

## Business Domain Rules

### Master Data

The platform MUST have a dedicated Master Data domain. Initial Master
Data MUST include: Customer, Supplier, Item, Item Category, Unit,
Department, Warehouse, Currency, Bank, Salesman, Tax, and Payment Terms.

Master Data MUST be created once and referenced by other business
modules. The platform MUST NOT create duplicate versions of the same
master entity inside Sales, Purchasing, Inventory, or Finance. Master
Data APIs MUST be reusable by consuming modules. Master data definitions
MUST remain independent from the business transaction behavior that uses
them.

### Organization and Application Context

The ERP MUST support organizational context including Company, Branch,
Financial Year, and Accounting Period. The application context MUST be
available to appropriate business operations. The frontend Shell MUST
maintain the active application context. The backend MUST independently
validate organizational context as stated in Core Principle V.

## Governance

This constitution supersedes conflicting local practices for architecture,
technology, security, data, and development decisions on the ERP platform.

Any significant deviation from this constitution MUST be explicitly
justified. Changes that affect architecture, technology, security,
database strategy, domain boundaries, micro-frontend boundaries,
accounting integrity, state management, UI library strategy, or
third-party UI component dependencies MUST be reviewed before
implementation.

The constitution MUST evolve only when there is a clear architectural
reason to do so. Amendments MUST:

1. Document the motivation and impact.
2. Update this file with a semantic version bump:
   - MAJOR: backward-incompatible governance/principle removals or
     redefinitions
   - MINOR: new principle/section added or materially expanded guidance
   - PATCH: clarifications, wording, typo fixes, non-semantic refinements
3. Set **Last Amended** to the amendment date (ISO YYYY-MM-DD).
4. Preserve **Ratified** as the original adoption date unless the
   constitution is wholly replaced.

Compliance review expectations:

* Specs, plans, tasks, and implementation reviews MUST verify alignment
  with this constitution.
* Complexity and deviations MUST be justified in writing.
* Spec-Driven Development lifecycle gates MUST be respected for
  significant features.

**Version**: 3.0.1 | **Ratified**: 2026-09-08 | **Last Amended**: 2026-09-18
