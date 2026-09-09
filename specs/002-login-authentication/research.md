# Research: Login and Authentication

**Feature**: `002-login-authentication` | **Date**: 2026-09-08

All Technical Context unknowns resolved. Decisions below guide implementation and tasks.

---

## 1. Incremental integration with Platform Foundation

**Decision**: Implement auth on the existing Shell + Clean Architecture API without restructuring the monorepo. Replace foundation auth placeholders (`AuthSession`, `TokenStorage`, `allowAllGuard`, empty backend `IAuthSession`/`ITokenStorage`) with real implementations. Touch foundation only where required: credentialed CORS, authentication middleware, Shell routes/bootstrap, interceptor chain order.

**Rationale**: Spec FR-023; constitution incremental order.

**Alternatives considered**:
- New auth microservice — rejected (modular monolith; premature).
- Duplicate Shell auth outside `@erp/core` — rejected (constitution: shared auth in Shell/core).

---

## 2. Backend auth architecture (no full Identity product)

**Decision**: Custom minimal `AuthUser` + `RefreshSession` domain/persistence. Application use cases: Login, Refresh, Logout, GetCurrentUser (`me`). Infrastructure: `PasswordHasher<AuthUser>` (ASP.NET Identity hashing algorithms without UserManager/UI), JWT creation/validation, refresh token generation (cryptographically random), hashed verifier persistence, EF configurations, optional Dev/Testing seed. Api: thin `AuthController` under `/api/v1/auth/*`, FluentValidation or DataAnnotations on requests, `[Authorize]` on `me` and future protected resources.

**Rationale**: Avoids coupling to full ASP.NET Identity user/role schema while User Management is out of scope; still uses proven password hashing.

**Alternatives considered**:
- Full ASP.NET Identity + EF stores now — rejected (pulls roles/claims admin surface; User Management later).
- IdentityServer/Keycloak — rejected (out of scope; overkill for this increment).

---

## 3. Token strategy (access + refresh)

**Decision**:
- **Access token**: JWT Bearer, short-lived default **15 minutes** (configurable). Claims: `sub` (user id), `unique_name`/`email` or preferred username claim, `jti`. No roles/permissions claims yet.
- **Refresh token**: Opaque random token; store only **hash/verifier** server-side; deliver via **HttpOnly + Secure + SameSite** cookie (`erp_refresh` or similar); **not** returned in JSON body.
- **Login/refresh JSON**: returns `accessToken`, `expiresAt` (UTC), and minimal `user` summary (`id`, `username`/`email` display fields as available)—no refresh token in body.
- **Rotation**: every successful refresh issues a new refresh token, invalidates the previous verifier, updates cookie; **reuse of a rotated token** revokes that **session family** and denies refresh.
- **Concurrent sessions**: each login creates a new session family; logout revokes current session only.

**Rationale**: Spec FR-005–009, clarifications on rotation and multi-session; XSS-resistant refresh handling.

**Alternatives considered**:
- Refresh token in `localStorage` / response body — rejected (XSS risk; conflicts with FR-009).
- Long-lived JWT only — rejected (constitution + refresh requirements).
- No rotation — rejected (clarification).

---

## 4. Cookie, CORS, and cross-origin local dev

**Decision**:
- Enable CORS policy with **exact Shell origins** + **`AllowCredentials()`** (required for refresh cookie). Do **not** use `AllowAnyOrigin` with credentials.
- Cookie flags: `HttpOnly=true`; `Secure=true` in Staging/Production; Development may set `Secure=false` only when serving API over HTTP, documented in quickstart.
- `SameSite`: **`None`** when Shell and API are cross-site (typical local `4200`↔`5080`); **`Lax`** acceptable when same-site reverse proxy is used later. Document per environment in config.
- Frontend HTTP client must use `withCredentials: true` for auth cookie endpoints (and generally for API calls once cookies matter).
- Path/name of refresh cookie configurable; clear cookie on logout.

**Rationale**: Foundation today uses CORS without credentials; auth cookies require the minimal change.

**Alternatives considered**:
- Same-origin BFF/proxy only — good long-term but not required to unblock local auth; can add later.
- `SameSite=Lax` cross-port localhost — unreliable for credentialed cross-origin; rejected for default local setup.

---

## 5. Session restore without unnecessary refresh

**Decision**: On login/refresh success, set a **non-sensitive session indicator** cookie (e.g. `erp_auth=1`, readable by JS, not a secret). On Shell bootstrap: if indicator present, call `POST /api/v1/auth/refresh` once (with credentials); on success establish Signals auth state + memory access token; on failure clear indicator and remain unauthenticated. If indicator absent, **skip** refresh call.

**Rationale**: Spec FR-013 — avoid unnecessary auth API calls when no session; HttpOnly refresh cookie cannot be read by JS to decide.

**Alternatives considered**:
- Always call refresh on every boot — simpler but violates “avoid unnecessary calls.”
- Rely solely on access token in `sessionStorage` — weaker XSS posture; rejected vs memory + cookie design.

---

## 6. Frontend auth state, interceptor, and guards

**Decision**:
- **Signals** auth state machine: `Unauthenticated | Authenticating | Authenticated | Refreshing | SigningOut`.
- **Memory-only** access token store implementing/replacing `TokenStorage`.
- **Auth interceptor** (after correlation, coordinated with loading/error): attach `Authorization: Bearer`; skip attaching on login/refresh; on 401 for protected calls, single-flight refresh then one retry; on refresh failure → clear state, redirect `/login`.
- **Guards**: `authGuard` for protected Shell routes; `guestGuard` for `/login` (redirect authenticated users to home/return). Preserve **safe relative `returnUrl`** query (or router state); reject absolute/external URLs.
- Login feature under Shell `features/auth/login`; Angular Material form controls; reuse global loader (`X-Skip-Loading` only where appropriate) and snackbar/error infrastructure.
- Logout control available from Shell chrome (minimal).

**Rationale**: Spec FR-012–016, clarifications on return URL; constitution Signals-first.

**Alternatives considered**:
- NgRx auth store — rejected (no demonstrated need).
- Permission guards — out of scope.

---

## 7. Login UX and error presentation

**Decision**: Professional ERP login page with branding area, username/email + password (show/hide), validation, disabled submit while authenticating. Client validation for required fields only. Server remains authoritative. Invalid credentials and inactive accounts share the **same generic** client message; rate-limit returns a safe throttle message. Prefer inline auth error on the form for credential failures; use global toast for unexpected/network errors consistent with foundation interceptor (tune so login failures are not doubly noisy—e.g. mark expected auth failures or handle in Login component).

**Rationale**: Spec User Stories 1–2; clarification on inactive messaging.

**Alternatives considered**: Toast-only for all auth errors — acceptable but weaker for field-adjacent feedback.

---

## 8. Rate limiting

**Decision**: Use ASP.NET Core **rate limiting** on `POST /api/v1/auth/login` partitioned by client IP (and optionally forwarded header when behind a trusted proxy). Configurable permit limit/window (sensible defaults, e.g. ~10 attempts / minute / IP—exact numbers finalized in implementation config). **No** account lockout. Return Problem Details with appropriate status (e.g. 429).

**Rationale**: Clarification Q1; FR-026.

**Alternatives considered**: Account lockout — rejected (clarification). Defer entirely — rejected (security acceptance risk).

---

## 9. Configuration and secrets

**Decision**: Add configuration sections (names illustrative):
- `Authentication:Jwt` — Issuer, Audience, SigningKey (env/user-secrets), AccessTokenLifetime
- `Authentication:Refresh` — CookieName, IndicatorCookieName, Lifetime, SameSite, Secure policy
- `Authentication:Seed` — Username/Email + Password from env for Dev/Testing seed (never commit password)
- CORS already `Cors:AllowedOrigins` — keep; enable credentials

Document in `.env.example` / `appsettings.*.example` without real secrets.

**Rationale**: Constitution secrets rule; FR-025.

**Alternatives considered**: Hard-coded JWT key for “dev convenience” in committed appsettings — rejected.

---

## 10. Logging and security hygiene

**Decision**: Structured logs for login success/failure, refresh success/denial (including reuse), logout, rate-limit hits. Log user id / login identifier where safe; **never** log passwords, access tokens, refresh tokens, or Authorization headers. Use redaction helpers if request logging middleware is enabled. Distinct inactive vs invalid may appear **only** in server logs, not client payloads.

**Rationale**: Constitution + FR-024; clarification on inactive messaging.

**Alternatives considered**: Full audit tables now — deferred (out of scope).

---

## 11. Seeding authenticatable users

**Decision**: On Development/Testing startup (or dedicated seed step), ensure at least one **active** `AuthUser` exists if configured seed credentials are present. Hash password with the same hasher used at runtime. Integration tests create users via helpers or test seed, not production passwords.

**Rationale**: Spec assumption (User Management out of scope).

**Alternatives considered**: Manual SQL-only seed docs — weaker for CI; use code seed + docs.

---

## 12. Protected endpoint for verification

**Decision**: Expose `GET /api/v1/auth/me` requiring Bearer authentication, returning minimal authenticated user summary. Use for interceptor/guard integration tests and Shell session confirmation. Do not expand into profile/User Management.

**Rationale**: Spec integration tests need a protected endpoint; health may remain anonymous for ops.

**Alternatives considered**: Protect platform health — rejected (breaks anonymous health/CI checks).

---

## 13. Default lifetimes (configurable)

**Decision**: Defaults — access token **15 minutes**; refresh session **7 days** absolute from session creation (sliding optional later; not required now). Document that operators may shorten for higher security.

**Rationale**: Spec assumptions (“minutes” / “workday+”); concrete defaults unblock tests.

**Alternatives considered**: 8-hour refresh only — also fine; 7 days better for “browser refresh restores session” UX across a work week with rotation still limiting token lifetime exposure.

---

## 14. Testing approach

**Decision**:
- **Backend unit**: password verify, JWT issue/validate, refresh rotate/reuse revoke, login/logout use cases, generic failure mapping.
- **Backend integration**: login sets cookie + returns access token; refresh rotates cookie; logout clears; reuse fails; `me` 401 without token / 200 with; invalid credentials; rate limit smoke if feasible.
- **Frontend unit**: form validation, auth state transitions, guard returnUrl, interceptor single-flight refresh, logout/restore logic (mocked HTTP).

**Rationale**: FR-022.

**Alternatives considered**: E2E Playwright in this feature — optional stretch; not required if unit/integration cover acceptance paths.
