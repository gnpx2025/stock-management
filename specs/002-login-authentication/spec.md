# Feature Specification: Login and Authentication

**Feature Branch**: `002-login-authentication`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Implement the Login and Authentication feature for the ERP platform based on the ratified constitution and the completed Platform Foundation. Second incremental feature: secure login, JWT access token, refresh session, Shell route protection, session restoration, logout, and authentication error/loading handling—without User Management, roles/permissions, organization context, MFA, SSO, password reset, or business modules."

## Constitution Alignment

This feature is the second item in the constitutionally approved implementation order (Platform Foundation → Authentication / Login → …). Platform Foundation (`001-platform-foundation`) is complete and MUST remain intact except where a genuine authentication requirement necessitates a minimal, justified change.

**Alignment with Constitution v2.0.0:**

- Shell owns authentication entry, global loading, global notifications, and global error handling; Login is a Shell authentication experience.
- Authentication MUST support secure session/token handling, access tokens, refresh tokens, logout, and session expiration.
- Authorization (roles, permissions, RBAC) is constitutionally required later but is **explicitly out of scope** for this feature; designs MUST allow authorization claims and permission guards to be added without redesigning login.
- Secrets (including signing keys) MUST NOT be committed; environment/secret management from Platform Foundation continues.
- Passwords, access tokens, and refresh tokens MUST NOT appear in logs, exceptions, or telemetry.
- Authentication events SHOULD be auditable; this feature records authentication security outcomes via existing structured logging/observability without implementing a full audit module.
- Frontend stack and UI library rules (Angular Material primary, shared UI library, Signals-first state, no competing UI libraries) remain binding.
- Backend Clean Architecture and `/api/v1` conventions remain binding.

**Noted non-conflicts:**

- Full User Management, roles/permissions, company/branch/financial-year context, and business domains remain deferred per constitution order and this feature’s explicit exclusions.
- Application-context selection placeholders from Platform Foundation stay placeholders; this feature does not implement context selection.

## Clarifications

### Session 2026-09-08

- Q: Should failed login attempts be rate-limited or temporarily lock an account after repeated failures in this feature? → A: Rate-limit login by IP/client only (no account lockout)
- Q: After a successful login that started from a protected URL the user tried to open, where should they land? → A: Return to the originally requested safe in-app path when present; otherwise home
- Q: When an access token is refreshed, should the refresh token itself be rotated (new refresh token issued and the old one invalidated)? → A: Rotate on each refresh; invalidate prior token; reuse of rotated token fails the session
- Q: If the same user signs in again from another browser or device while an existing session is still valid, what should happen to the older session? → A: Multiple concurrent sessions allowed — each login creates its own independent session
- Q: When an inactive account tries to sign in with the correct password, should the user see the same generic failure as for wrong credentials, or a distinct “account inactive” message? → A: Same generic failure as invalid credentials (no inactive-specific message)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in with credentials (Priority: P1)

As an ERP user, I can open the application, reach a Login page, enter my username or email and password, and successfully authenticate so that I can use the protected ERP Shell.

**Why this priority**: Without successful credential authentication, no protected ERP capability can be used. This is the core value of the feature.

**Independent Test**: With a known active test identity, open the app unauthenticated, complete Login with valid credentials, and confirm authenticated session and access to the protected application entry.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user opens the application (or a protected route), **When** the app finishes bootstrap, **Then** the user is redirected to `/login` and does not see the protected application Shell content.
2. **Given** the Login page is shown, **When** the page loads, **Then** the user sees ERP/application branding, username or email field, password field with show/hide, a Login action, and a clean professional ERP-appropriate layout using the platform UI standards.
3. **Given** the Login form, **When** the user submits with missing username/email or password, **Then** clear validation messages appear and no authentication request is sent.
4. **Given** valid required fields, **When** the user submits via the Login button or keyboard submit, **Then** authentication is attempted, the submit control is disabled while authenticating, and duplicate submissions are prevented.
5. **Given** valid credentials for an active user, **When** authentication succeeds, **Then** the user receives a short-lived access credential and a refresh session, authenticated state is established, and the user is taken to the originally requested safe in-app protected path when one was preserved during redirect-to-login; otherwise to the authenticated application entry route.
6. **Given** authentication is in progress, **When** the user observes the UI, **Then** the existing Shell global loading experience is used appropriately and protected navigation is blocked until authentication state is resolved.

---

### User Story 2 - Fail safely on bad or inactive credentials (Priority: P1)

As an ERP user (or attacker), when credentials are wrong or the account is inactive, I receive the same safe, generic authentication failure without learning whether a specific username/email exists or whether an account is inactive, and without seeing sensitive backend details.

**Why this priority**: Credential failure handling is required for security and for trustworthy everyday use.

**Independent Test**: Attempt login with wrong password, unknown identifier, and inactive account; confirm identical generic user-facing errors and no sensitive leakage.

**Acceptance Scenarios**:

1. **Given** invalid credentials, **When** the user attempts login, **Then** a generic authentication error is shown (via existing global notification/error infrastructure and/or inline auth error as appropriate) and no authenticated session is created.
2. **Given** an inactive user account (even with a correct password), **When** the user attempts login, **Then** authentication is denied with the **same** generic user-facing authentication failure used for invalid credentials (no inactive-specific message).
3. **Given** a network or unexpected server failure during login, **When** the attempt fails, **Then** a non-sensitive error is shown and the user remains unauthenticated.
4. **Given** any authentication failure, **When** responses and logs are inspected, **Then** passwords and tokens are absent, and client-visible responses do not reveal whether a specific username/email exists or whether an account is inactive.

---

### User Story 3 - Use the app only while authenticated (Priority: P1)

As an authenticated ERP user, I can access protected application routes; as an unauthenticated user, I cannot. Authenticated users who visit Login are sent into the app instead of seeing Login again.

**Why this priority**: Route protection is the primary user-visible enforcement of authentication on the frontend (backend remains authoritative for APIs).

**Independent Test**: Attempt protected routes while logged out and logged in; attempt `/login` while logged in.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to any protected application route, **Then** they are redirected to `/login` and the intended in-app path is preserved for post-login return when it is a safe relative application route.
2. **Given** an authenticated user, **When** they navigate to protected routes, **Then** those routes are accessible without being bounced to Login.
3. **Given** an authenticated user, **When** they navigate to `/login`, **Then** they are redirected to the authenticated application entry route.
4. **Given** this feature, **When** route protection is reviewed, **Then** only authentication (signed-in vs not) is enforced—no permission-based route guards are introduced.

---

### User Story 4 - Keep working when the access credential expires (Priority: P2)

As an authenticated ERP user, when my short-lived access credential expires during use, the system renews it using my refresh session when still valid, without asking me to log in again, and without creating refresh storms under concurrent requests.

**Why this priority**: ERP sessions must remain usable across typical work periods without forcing constant re-login, while keeping access credentials short-lived.

**Independent Test**: Establish a session, allow or simulate access-credential expiry with a still-valid refresh session, trigger protected API calls (including concurrent ones), and confirm renewal and continued access.

**Acceptance Scenarios**:

1. **Given** an authenticated session whose access credential has expired but whose refresh session is valid, **When** a protected API request is made, **Then** the system refreshes the access credential (rotating the refresh token and invalidating the previous one), retries the request once after success, and the user remains authenticated.
2. **Given** multiple concurrent protected requests that discover expiry together, **When** refresh is needed, **Then** only one refresh operation runs and the others wait for its result (no unnecessary parallel refresh storm; no infinite refresh loop).
3. **Given** a refresh session that is expired, invalid, or revoked, **When** refresh is attempted, **Then** the user becomes unauthenticated and is redirected to `/login`.
4. **Given** authenticated API requests, **When** they are sent, **Then** the access credential is attached as required; login and refresh requests do not unnecessarily carry the access credential.
5. **Given** a refresh token that was already rotated/replaced, **When** that old token is presented again, **Then** refresh is denied and the related session family is ended (treat as reuse/compromise), requiring re-authentication.

---

### User Story 5 - Restore session after browser refresh (Priority: P2)

As a returning ERP user with a still-valid refresh session, when I reload the application I am restored to an authenticated state without re-entering credentials; if no session can be restored, I remain on Login and do not briefly see protected Shell content.

**Why this priority**: Losing session on every refresh would make the ERP unusable; leaking Shell UI before auth resolution would be a poor and insecure experience.

**Independent Test**: Log in, reload the browser; also load the app with no prior session and confirm no unnecessary restore calls and no protected Shell flash.

**Acceptance Scenarios**:

1. **Given** a valid refresh session exists after prior login, **When** the application starts, **Then** the app determines that session restoration is possible, establishes authenticated state (refreshing the access credential if needed), and shows the protected application entry—not Login.
2. **Given** no authenticatable session exists, **When** the application starts, **Then** the app remains unauthenticated, does not make unnecessary authentication restore/refresh calls, and does not show the protected Shell to the user.
3. **Given** session restoration is in progress, **When** the user would otherwise see application chrome, **Then** protected Shell content is withheld until authentication state is known.

---

### User Story 6 - Sign out securely (Priority: P2)

As an authenticated ERP user, I can log out so that my refresh session is invalidated server-side where applicable, local authentication state is cleared, further authenticated API use is prevented, and I am returned to Login—even if my access credential has already expired.

**Why this priority**: Secure logout is required for shared workstations and session hygiene.

**Independent Test**: Log in, log out; attempt protected routes and APIs; repeat logout after access-credential expiry with refresh session still present.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they log out, **Then** frontend authentication state is cleared, the **current** refresh session is revoked/invalidated when possible (other sessions for the same user are unaffected), authentication-related client state is removed, and the user is redirected to `/login`.
2. **Given** an expired access credential but a still-valid refresh session, **When** the user logs out, **Then** logout still invalidates the current refresh session safely and ends the client session.
3. **Given** completed logout, **When** the user attempts protected routes or authenticated API use, **Then** they are treated as unauthenticated.
4. **Given** the same user is signed in on two browsers, **When** they log out on one, **Then** the other browser’s session remains valid until its own logout, expiry, or reuse/compromise handling.

---

### Edge Cases

- User submits login while offline or the API is unreachable → non-sensitive failure; remain unauthenticated; no partial authenticated state.
- User double-clicks Login or presses Enter repeatedly → only one in-flight authentication attempt; button stays disabled while authenticating.
- Access credential expires exactly while a refresh is already running → subsequent callers wait on the in-flight refresh; no loop.
- Refresh succeeds but the retried request still fails for non-auth reasons → surface as a normal API/business error, not as a login failure.
- Refresh token reuse after revocation/logout (or detected reuse of an already-rotated token) → deny refresh; end the related session family; require re-authentication; treat as unauthenticated.
- Inactive user who somehow still holds an old refresh session → refresh/login denied; session ended.
- Authenticated user opens Login in another tab → redirect to authenticated entry; session remains consistent with server refresh validity.
- Unauthenticated user is sent to Login from a protected deep link, then signs in successfully → lands on that original safe in-app path, not an external URL.
- Return target is missing, invalid, or external → fall back to the authenticated application entry/home.
- Same user logs in on a second browser → both sessions remain valid independently; logging out one does not end the other.
- Browser blocks cookies or credentials mode fails under misconfiguration → session restore/refresh via cookie cannot succeed; user remains or becomes unauthenticated with a safe error (no silent “half logged in” state).
- Repeated failed logins from the same client/IP exceed the rate limit → further login attempts are rejected with a safe throttling error until the window resets; accounts are not locked and no admin unlock flow is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Login experience at `/login` owned by the Shell, including branding area, username or email field, password field with show/hide, Login action, validation messages, authentication error display, and authenticating/loading feedback.
- **FR-002**: System MUST require username/email and password before attempting authentication; client validation MUST NOT replace server-side authentication decisions.
- **FR-003**: System MUST authenticate against the backend using credentials and MUST establish an authenticated session only after successful backend authentication.
- **FR-004**: System MUST expose authentication operations under the established versioned API convention (`/api/v1/...`), including login, refresh, and logout capabilities (exact resource paths may follow platform naming norms, e.g. `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`).
- **FR-005**: On successful login, the system MUST issue a short-lived access token (JWT bearer) and a refresh session sufficient to continue the session; responses MUST NOT return unnecessary sensitive data.
- **FR-006**: Access tokens MUST include only claims required at this stage (e.g. user identifier, username/email, token identifier where appropriate) and MUST NOT embed large profile/master-data payloads or role/permission sets (those remain future work, but claim extension MUST remain possible).
- **FR-007**: System MUST support refresh-token-based continuation: validate refresh sessions securely, renew access tokens, **rotate the refresh token on every successful refresh** (issue a new token and invalidate the previous one), prevent use of invalidated/revoked/rotated refresh tokens, treat reuse of an already-rotated refresh token as a security event that fails the related session family, support logout revocation, and store refresh-session server state securely (prefer hashed/verifier storage over plaintext token persistence).
- **FR-008**: Refresh-token design MUST allow multiple concurrent independent sessions per user (each successful login creates its own session/session family) and MUST allow future multi-device/session management UI without redesigning authentication fundamentals. Logout in this feature MUST revoke only the current session (not all sessions for the user). A “sign out everywhere” capability is out of scope.
- **FR-009**: Token storage MUST prioritize protection against token theft and XSS: refresh session MUST use an HttpOnly, Secure, SameSite cookie (with environment-appropriate SameSite/CORS credential settings); access token MUST be short-lived and held in frontend memory (not `localStorage`). The selected strategy and security rationale MUST be documented for implementers and operators.
- **FR-010**: Backend MUST verify passwords server-side using a strong password hashing mechanism; plaintext passwords MUST never be stored, logged, returned, or included in exceptions/telemetry.
- **FR-011**: System MUST persist only the minimum user identity required to authenticate (stable user identifier, login identifier/username/email, password hash, active/inactive flag, and authentication metadata required by the mechanism)—not full User Management, profiles, roles, or permissions.
- **FR-012**: Frontend authentication state MUST represent at least: Unauthenticated, Authenticating, Authenticated, Refreshing, and SigningOut, using the platform’s Signals-first state approach (not introducing a new global state library for auth without demonstrated need).
- **FR-013**: On application bootstrap, the system MUST attempt session restoration only when a refresh session may exist; restore authenticated state when possible (including refresh-if-needed); otherwise remain unauthenticated; MUST NOT reveal protected Shell content before auth state is resolved.
- **FR-014**: System MUST centrally attach access credentials to authenticated API requests, omit them from login/refresh where unnecessary, coordinate single-flight refresh on expiry, retry the failed request after successful refresh, and on refresh failure transition to unauthenticated and redirect to `/login` without infinite refresh loops.
- **FR-015**: System MUST protect application routes by authentication: public `/login`; all other application Shell routes protected; unauthenticated users redirected to `/login` with the intended destination preserved when it is a safe same-app relative path (reject external/open redirects); after successful login, redirect to that preserved path when present, otherwise to the authenticated entry route; authenticated users hitting `/login` redirected to the authenticated entry route. Permission guards MUST NOT be implemented in this feature.
- **FR-016**: Logout MUST clear client authentication state, revoke/invalidate the **current** refresh session when applicable (other concurrent sessions for the same user remain valid), prevent further authenticated API use from this client, and redirect to `/login`, including when the access token is already expired but the refresh session can still be invalidated.
- **FR-017**: System MUST handle invalid credentials, inactive user, expired session, invalid refresh, revoked refresh, rate-limited login, and network/server errors with safe user-facing messages; invalid credentials **and inactive-account login attempts** MUST use the **same** generic authentication failure that does not reveal account existence or active/inactive status to the client. Distinct inactive reasons MAY be recorded only in server-side structured logs.
- **FR-018**: Authentication API failures MUST use the Platform Foundation standardized error/Problem Details approach and appropriate HTTP status codes without exposing internal exceptions or sensitive authentication details.
- **FR-019**: Authentication operations MUST reuse Shell global loading and global notification/error infrastructure; MUST NOT introduce a competing feature-specific global loader or a new UI component library.
- **FR-020**: Shared frontend authentication contracts MUST remain minimal (e.g. login request/response, refresh response, authenticated user summary) and MUST NOT define contracts for User Management, roles, permissions, or organization features.
- **FR-021**: Persistence MUST use the platform PostgreSQL + EF Core foundation with only authentication-required entities, configurations, migrations, and indexes/constraints, designed so future User Management can extend identity without a full redesign.
- **FR-022**: System MUST provide automated tests covering: frontend login validation, success/failure, loading and state transitions, route guard behavior, logout, session restoration, HTTP auth attachment/refresh coordination; backend unit tests for credential/password/JWT/refresh/revocation/use cases; backend integration tests for login/refresh/logout, protected endpoint authentication, and invalid/expired refresh cases.
- **FR-023**: Implementation MUST NOT modify or restructure completed Platform Foundation behavior except for minimal, necessary authentication integration points (e.g. enabling credentialed CORS for refresh cookies, wiring auth into Shell bootstrap/routing).
- **FR-024**: Passwords, access tokens, and refresh tokens MUST NOT be logged; authentication security outcomes (login success/failure, logout, refresh denial) SHOULD be recorded via existing structured logging without building a full audit subsystem in this feature.
- **FR-025**: Production deployments MUST use HTTPS; cookie, CORS, and signing-secret settings MUST be environment-configurable and documented where operators must set them.
- **FR-026**: System MUST rate-limit login attempts by client/IP (e.g. fixed window or progressive delay) to mitigate brute-force guessing; MUST NOT implement account lockout or admin unlock flows in this feature. Throttling responses MUST remain non-enumerating and MUST NOT expose passwords or tokens.

### Key Entities

- **Authenticatable User (minimal identity)**: Represents a person who can sign in. Attributes include stable identifier, login identifier (username and/or email), password hash, active/inactive status, and any timestamps/metadata required for authentication—not profile, org membership, or roles.
- **Access Token**: Short-lived bearer credential proving API authentication for a user; carries minimal identity claims only.
- **Refresh Session**: Server-tracked long-lived session used to obtain new access tokens; revocable; rotated on each successful refresh; stored securely (hashed/verifier); cookie-delivered to the browser; multiple independent sessions per user allowed; designed for future multi-session management UI; reuse of a rotated token ends that session family only.
- **Authentication State (client)**: Application-visible session status (unauthenticated → authenticating/authenticated/refreshing/signing out) and the minimal authenticated user summary needed by the Shell.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An unauthenticated user opening the application or any protected route reaches Login within one navigation cycle and never sees protected Shell content while unauthenticated.
- **SC-002**: A user with valid active credentials can complete sign-in (credentials → authenticated entry) in under 30 seconds under normal local/network conditions.
- **SC-003**: 100% of invalid-credential and inactive-account login attempts in acceptance testing show the same generic failure and create no authenticated session; none reveal whether the username/email exists or whether an account is inactive.
- **SC-004**: After successful login, 100% of protected-route attempts succeed without redirect to Login until logout or refresh-session invalidation.
- **SC-005**: When the access credential expires with a valid refresh session, the user continues work without re-entering credentials for at least the refresh-session lifetime under test conditions; concurrent expired requests cause a single coordinated refresh (verified in tests).
- **SC-006**: After logout (including with expired access credential), protected routes redirect to Login and refresh/login with the old session fails in integration tests.
- **SC-007**: Browser reload after valid login restores authenticated access without re-entering credentials in at least 95% of scripted restoration trials with a valid refresh session present.
- **SC-008**: Security review of sample logs and error payloads from login/refresh/logout tests shows zero occurrences of passwords or raw tokens.
- **SC-009**: Platform Foundation health, Shell layout/theme, global loader, and global notifications continue to pass their existing acceptance checks after this feature is integrated.
- **SC-010**: All agreed automated frontend and backend authentication unit/integration tests for this feature pass in CI.

## Assumptions

- Platform Foundation (`001-platform-foundation`) remains the base: Shell, shared libraries, API versioning, Problem Details errors, global loader/notifications, PostgreSQL/EF Core, CORS/config patterns, and observability are reused.
- **Token storage (selected)**: HttpOnly + Secure + SameSite refresh-token cookie; short-lived access token in memory only; session restore via silent refresh on bootstrap when a refresh cookie may exist. Rationale: reduces XSS exfiltration of long-lived credentials versus `localStorage`, keeps access tokens short-lived, enables server-side revocation. Cross-origin local dev requires credentialed CORS and documented cookie SameSite settings.
- **Refresh token rotation**: On every successful refresh, issue a new refresh token, invalidate the prior one, and update the HttpOnly cookie; reuse of a rotated token fails and ends that session family only.
- **Concurrent sessions**: Multiple independent sessions per user are allowed; logout revokes only the current session. “Sign out everywhere” is out of scope for this feature.
- **Access token lifetime**: Short-lived by default (on the order of minutes, e.g. ~15 minutes) unless environment configuration sets otherwise; refresh session lasts long enough for a typical workday and is configurable.
- **Login identifier**: A single field accepts username or email; backend resolves the authenticatable identity.
- **Post-login / authenticated entry route**: After login, return to the originally requested safe in-app relative path when the user was redirected to Login from a protected route; otherwise use the Shell’s existing authenticated application entry/home from Platform Foundation. External or absolute URLs MUST NOT be accepted as return targets (open-redirect prevention).
- **Initial authenticatable users**: Because User Management is out of scope, at least one active seed/test identity is provisioned for Development/Testing (and integration tests) via secure seed/migration; production user provisioning remains out-of-band until User Management. Seed passwords are environment-provided secrets, never committed in plaintext.
- **Inactive user messaging**: Inactive-account login attempts receive the same generic client-facing failure as invalid credentials (no inactive-specific UI message). Distinct denial reasons may appear only in server-side structured logs.
- **Audit**: Full audit-module UI/storage is out of scope; structured security logging of auth outcomes satisfies the immediate constitutional auditability expectation for this increment.
- **No MFA, SSO, social login, password reset, or email verification** in this feature.
- **No NgRx (or equivalent) for auth state** unless a later demonstrated requirement appears; Signals remain default.
- Minimal foundation touch-points (e.g. CORS credentials, Shell route table, bootstrap) are allowed when required for auth; no unrelated foundation restructuring.
- HTTPS is mandatory in Staging/Production; local Development may use HTTP only where cookie Secure flags are adjusted per documented local guidance.
- **Login brute-force mitigation**: IP/client rate limiting only; no per-account lockout (avoids User Management unlock dependency). Exact thresholds are configurable and may be finalized in planning/implementation.

## Out of Scope

- User management / user CRUD / profiles
- Roles, permissions, RBAC administration, permission route guards
- Company, branch, organization, financial year, accounting period, application context selection
- Customer/Supplier/Item masters; Finance; Inventory; Purchasing; Sales; Reports
- Password reset, email verification, MFA/2FA, social login, SSO
- Competing UI libraries; feature-specific global loader replacement
- Broad business-domain test suites unrelated to authentication

Where a future feature needs an interface, only the minimum contract may be introduced—without implementing that future feature.
