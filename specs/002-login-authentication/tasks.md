# Tasks: Login and Authentication

**Input**: Design documents from `/specs/002-login-authentication/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — feature spec explicitly requires frontend and backend unit/integration tests (FR-022, §26, SC-010).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend: `frontend/` (Nx — `apps/shell`, `libs/core|ui|shared|contracts`)
- Backend: `backend/src/ERP.*`, `backend/tests/ERP.*`
- Docs/config: root `.env.example`, `docs/`, `README.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Auth packages, config placeholders, and folder scaffolding on the completed Platform Foundation

- [x] T001 Add JWT Bearer, token, Identity password-hasher, and rate-limiting package references to `backend/src/ERP.Api/ERP.Api.csproj` and `backend/src/ERP.Infrastructure/ERP.Infrastructure.csproj` as needed (no full Identity UI)
- [x] T002 [P] Extend `.env.example` and `backend/src/ERP.Api/appsettings.json` / `appsettings.Development.json.example` with `Authentication:Jwt`, `Authentication:Refresh`, and `Authentication:Seed` placeholders (no real secrets)
- [x] T003 [P] Create backend auth folder scaffolding: `backend/src/ERP.Domain/Identity/`, `backend/src/ERP.Application/Auth/`, `backend/src/ERP.Infrastructure/Identity/`, `backend/src/ERP.Api/Controllers/Auth/`
- [x] T004 [P] Create frontend auth folder scaffolding: `frontend/apps/shell/src/app/features/auth/login/` and replace/extend `frontend/libs/core/src/lib/auth/` (keep barrels exportable)
- [x] T005 [P] Document auth env vars and cookie/CORS notes in `docs/authentication.md` (stub OK; finalize in polish)

**Checkpoint**: Packages referenced; config examples present; auth directories exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Persistence, JWT/cookie/CORS plumbing, shared contracts, and auth state skeleton that ALL stories need

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Replace foundation auth TypeScript contracts with `LoginRequest`, `AuthTokenResponse`, `AuthenticatedUser`, `AuthSession`/`AuthStatus`, and updated `TokenStorage` in `frontend/libs/contracts/src/` per `specs/002-login-authentication/contracts/frontend-contracts.md`; update `frontend/libs/contracts/src/index.ts`
- [x] T007 [P] Implement domain entities `AuthUser` and `RefreshSession` in `backend/src/ERP.Domain/Identity/` per `specs/002-login-authentication/data-model.md`
- [x] T008 Add EF Core configurations + `DbSet`s for `AuthUser`/`RefreshSession` in `backend/src/ERP.Infrastructure/Persistence/` and create migration under `backend/src/ERP.Infrastructure/Persistence/Migrations/`
- [x] T009 [P] Implement password hashing service using `PasswordHasher<AuthUser>` in `backend/src/ERP.Infrastructure/Identity/` and Application port in `backend/src/ERP.Application/Auth/`
- [x] T010 [P] Implement JWT access-token issuer/validator options binder in `backend/src/ERP.Infrastructure/Identity/` reading `Authentication:Jwt` (issuer, audience, signing key, 15m default lifetime)
- [x] T011 Register JWT Bearer authentication and authorization in `backend/src/ERP.Api/Program.cs`; map auth DI in `backend/src/ERP.Infrastructure/DependencyInjection.cs`
- [x] T012 Update CORS in `backend/src/ERP.Api/Program.cs` to `AllowCredentials()` with explicit Shell origins from `Cors:AllowedOrigins` (never `AllowAnyOrigin` with credentials)
- [x] T013 [P] Implement refresh-token generator + hasher/verifier helpers in `backend/src/ERP.Infrastructure/Identity/` (opaque token; store hash only)
- [x] T014 [P] Implement cookie writer/clearer for HttpOnly refresh cookie + non-HttpOnly session-indicator cookie in `backend/src/ERP.Api/` or Infrastructure helper used by Api (Secure/SameSite from config)
- [x] T015 Replace frontend placeholders: memory `TokenStorage` + Signals `AuthSessionService` (`Unauthenticated|Authenticating|Authenticated|Refreshing|SigningOut`) in `frontend/libs/core/src/lib/auth/`; export from `frontend/libs/core/src/index.ts`
- [x] T016 Ensure HTTP client defaults support credentials for API calls (interceptor or `provideHttpClient` options) in `frontend/libs/core/src/` / `frontend/apps/shell/src/app/app.config.ts`
- [x] T017 [P] Add Dev/Testing auth user seed hosted service or startup seed in `backend/src/ERP.Infrastructure/Identity/` reading `Authentication:Seed` (skip when unset; never log password)
- [x] T018 Extend `backend/tests/ERP.IntegrationTests` factory helpers to support auth cookie/JWT test setup in `backend/tests/ERP.IntegrationTests/` (e.g. extend `ErpWebApplicationFactory`)

**Checkpoint**: Migrations apply; JWT + CORS credentials configured; contracts and auth state skeleton ready — user stories can start

---

## Phase 3: User Story 1 - Sign in with credentials (Priority: P1) 🎯 MVP

**Goal**: User can open Login, submit valid credentials, receive access token + refresh session, reach authenticated Shell entry

**Independent Test**: With seed user, open app → `/login` → submit valid credentials → authenticated home; `GET /api/v1/auth/me` succeeds with Bearer

### Tests for User Story 1

- [x] T019 [P] [US1] Backend unit tests for password verify + JWT issue in `backend/tests/ERP.UnitTests/Auth/`
- [x] T020 [P] [US1] Backend integration tests for `POST /api/v1/auth/login` success + cookie set in `backend/tests/ERP.IntegrationTests/Auth/LoginTests.cs`
- [x] T021 [P] [US1] Frontend unit tests for login form required-field validation and successful login state transition in `frontend/apps/shell/src/app/features/auth/login/` and/or `frontend/libs/core/src/lib/auth/*.spec.ts`

### Implementation for User Story 1

- [x] T022 [P] [US1] Implement Login application use case/handler + DTOs/validators in `backend/src/ERP.Application/Auth/` (create refresh session family; hash token; do not return refresh in body)
- [x] T023 [US1] Implement `POST /api/v1/auth/login` in `backend/src/ERP.Api/Controllers/Auth/AuthController.cs` per `specs/002-login-authentication/contracts/auth-api.md` / `openapi-auth.yaml`
- [x] T024 [P] [US1] Implement `GET /api/v1/auth/me` (`[Authorize]`) returning minimal user in `backend/src/ERP.Api/Controllers/Auth/AuthController.cs`
- [x] T025 [P] [US1] Implement frontend Auth API client (`login`, `me`) in `frontend/libs/core/src/lib/auth/auth-api.service.ts`
- [x] T026 [US1] Build Login page (branding, username/email, password show/hide, submit, loading/disabled duplicate-submit) with Angular Material in `frontend/apps/shell/src/app/features/auth/login/` (originally PrimeNG; migrated in `003-angular-material-migration`)
- [x] T027 [US1] Wire public `/login` route and temporary navigation to Login for unauthenticated users in `frontend/apps/shell/src/app/app.routes.ts` (full guards refined in US3)
- [x] T028 [US1] On login success: store access token in memory, set Signals state to Authenticated, navigate to authenticated entry (or returnUrl if already present)
- [x] T029 [US1] Add structured security log for login success (no password/token) in login use case / `AuthController` path
- [x] T030 [US1] Verify seed user can authenticate end-to-end against local API per `specs/002-login-authentication/quickstart.md` §4

**Checkpoint**: MVP — valid credentials establish authenticated session and Shell entry

---

## Phase 4: User Story 2 - Fail safely on bad or inactive credentials (Priority: P1)

**Goal**: Invalid credentials and inactive accounts share the same generic client failure; rate limiting by IP; no sensitive leakage

**Independent Test**: Wrong password, unknown user, inactive user → same generic UI error; no tokens; 429 after burst; logs have no passwords/tokens

### Tests for User Story 2

- [x] T031 [P] [US2] Backend unit tests mapping inactive + invalid credentials to the same client-facing failure in `backend/tests/ERP.UnitTests/Auth/`
- [x] T032 [P] [US2] Backend integration tests for invalid login 401 generic detail + inactive user 401 generic in `backend/tests/ERP.IntegrationTests/Auth/LoginFailureTests.cs`
- [x] T033 [P] [US2] Frontend unit tests for invalid-credentials UI/error handling in `frontend/apps/shell/src/app/features/auth/login/*.spec.ts`

### Implementation for User Story 2

- [x] T034 [US2] Enforce generic Problem Details for invalid/inactive login in `backend/src/ERP.Application/Auth/` (distinct reason only in server logs)
- [x] T035 [US2] Configure ASP.NET rate limiter for `POST /api/v1/auth/login` by client IP in `backend/src/ERP.Api/Program.cs` (or dedicated `RateLimiting` config); return 429 Problem Details; no account lockout
- [x] T036 [US2] Surface safe login errors on Login UI (inline and/or toast without double-noise) in `frontend/apps/shell/src/app/features/auth/login/`; remain Unauthenticated
- [x] T037 [US2] Ensure error/request logging redacts Authorization headers, passwords, and tokens in `backend/src/ERP.Api/` logging configuration
- [x] T038 [P] [US2] Add integration smoke for login rate limiting (429) in `backend/tests/ERP.IntegrationTests/Auth/LoginRateLimitTests.cs` when feasible in test host

**Checkpoint**: Safe failures + throttle without enumeration or lockout

---

## Phase 5: User Story 3 - Use the app only while authenticated (Priority: P1)

**Goal**: Protected routes require auth; `/login` is public; safe returnUrl; authenticated users redirected away from Login; no permission guards

**Independent Test**: Logged out → protected route → `/login?returnUrl=...` → login → original path; logged in → `/login` → home

### Tests for User Story 3

- [x] T039 [P] [US3] Frontend unit tests for `authGuard` / `guestGuard` and safe returnUrl handling in `frontend/libs/core/src/lib/auth/*.spec.ts`

### Implementation for User Story 3

- [x] T040 [P] [US3] Implement `authGuard` and `guestGuard` in `frontend/libs/core/src/lib/auth/` (replace `allow-all.guard.ts` usage)
- [x] T041 [US3] Update `frontend/apps/shell/src/app/app.routes.ts`: `/login` public with guestGuard; Shell layout children protected with authGuard; preserve safe relative `returnUrl` only
- [x] T042 [US3] Implement returnUrl open-redirect prevention helper in `frontend/libs/core/src/lib/auth/` (reject absolute/external URLs)
- [x] T043 [US3] Ensure protected Shell content is not rendered while auth status is unresolved/authenticating during navigation in `frontend/apps/shell/src/app/`
- [x] T044 [US3] Confirm foundation health page remains reachable only when authenticated (or adjust only if intentionally public—default: protect Shell children)

**Checkpoint**: Route protection and safe deep-link return work without RBAC

---

## Phase 6: User Story 4 - Keep working when the access credential expires (Priority: P2)

**Goal**: Refresh rotates tokens; single-flight refresh; attach Bearer; reuse of rotated token fails session family; no infinite loops

**Independent Test**: Expire access token; concurrent API calls → one refresh → retries succeed; reuse old refresh → 401 and unauthenticated

### Tests for User Story 4

- [x] T045 [P] [US4] Backend unit tests for refresh rotation + reuse family revoke in `backend/tests/ERP.UnitTests/Auth/RefreshSessionTests.cs`
- [x] T046 [P] [US4] Backend integration tests for refresh success, rotation cookie, and reuse failure in `backend/tests/ERP.IntegrationTests/Auth/RefreshTests.cs`
- [x] T047 [P] [US4] Frontend unit tests for auth interceptor single-flight refresh and retry in `frontend/libs/core/src/lib/http/` or `auth/*.spec.ts`

### Implementation for User Story 4

- [x] T048 [P] [US4] Implement Refresh application use case (validate hash, rotate, family revoke on reuse) in `backend/src/ERP.Application/Auth/`
- [x] T049 [US4] Implement `POST /api/v1/auth/refresh` in `backend/src/ERP.Api/Controllers/Auth/AuthController.cs` (cookie in/out; no Bearer required)
- [x] T050 [US4] Implement auth HTTP interceptor: attach Bearer; skip login/refresh; on 401 single-flight refresh + one retry; on failure clear state and redirect `/login` in `frontend/libs/core/src/lib/http/` / `auth/`; register order in `provideErpCore`
- [x] T051 [US4] Wire AuthSessionService `Refreshing` state during interceptor refresh in `frontend/libs/core/src/lib/auth/`
- [x] T052 [US4] Add structured logs for refresh success/denial/reuse without token values in backend auth path
- [x] T053 [US4] Verify concurrent expired requests do not trigger multiple refresh calls (test coverage in T047)

**Checkpoint**: Expired access tokens renew safely; reuse attacks end the session family

---

## Phase 7: User Story 5 - Restore session after browser refresh (Priority: P2)

**Goal**: Bootstrap restores session via indicator cookie + silent refresh; skip call when no indicator; no protected Shell flash

**Independent Test**: Login → full reload → still authenticated; cold start with no cookies → no refresh call → Login

### Tests for User Story 5

- [x] T054 [P] [US5] Frontend unit tests for bootstrap restore (indicator present/absent) in `frontend/libs/core/src/lib/auth/*.spec.ts`

### Implementation for User Story 5

- [x] T055 [US5] Ensure login/refresh set session-indicator cookie and logout/failure clear it (backend cookie helper + frontend awareness) per research §5
- [x] T056 [US5] Implement APP_INITIALIZER / bootstrap auth restore in `frontend/apps/shell/src/app/` + `frontend/libs/core/src/lib/auth/` that calls refresh only when indicator present
- [x] T057 [US5] Hold protected Shell behind auth resolution gate during restore in `frontend/apps/shell/src/app/layout/` or root component
- [x] T058 [US5] Confirm no unnecessary refresh when indicator absent (unit assertion in T054)

**Checkpoint**: Browser refresh restores valid sessions without credential re-entry

---

## Phase 8: User Story 6 - Sign out securely (Priority: P2)

**Goal**: Logout revokes current refresh session only, clears client state/cookies, redirects to Login; works with expired access token

**Independent Test**: Logout → `/login`; old refresh fails; second browser session for same user remains; logout with expired access still clears server session

### Tests for User Story 6

- [x] T059 [P] [US6] Backend integration tests for logout revoke + multi-session independence in `backend/tests/ERP.IntegrationTests/Auth/LogoutTests.cs`
- [x] T060 [P] [US6] Frontend unit tests for logout state clearing and redirect in `frontend/libs/core/src/lib/auth/*.spec.ts`

### Implementation for User Story 6

- [x] T061 [P] [US6] Implement Logout application use case (revoke current session by refresh cookie hash only) in `backend/src/ERP.Application/Auth/`
- [x] T062 [US6] Implement `POST /api/v1/auth/logout` (prefer idempotent 204; clear cookies) in `backend/src/ERP.Api/Controllers/Auth/AuthController.cs`
- [x] T063 [US6] Implement frontend logout in AuthSessionService + Auth API client; clear memory token; set Unauthenticated; navigate `/login` in `frontend/libs/core/src/lib/auth/`
- [x] T064 [US6] Add Logout control to Shell chrome in `frontend/apps/shell/src/app/layout/`
- [x] T065 [US6] Ensure logout works when access token expired (refresh cookie still sent) — covered by T059
- [x] T066 [US6] Structured log for logout without tokens in backend auth path

**Checkpoint**: Secure logout; concurrent sessions preserved for other devices

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CI, architecture gates, quickstart validation, security hygiene

- [x] T067 [P] Finalize `docs/authentication.md` (cookie flags, CORS credentials, lifetimes, seed secrets, SameSite per env)
- [x] T068 [P] Update root `README.md` with auth quickstart link and seed/JWT secret setup pointers
- [x] T069 Ensure architecture tests in `backend/tests/ERP.ArchitectureTests/` still pass with new auth projects/layers
- [x] T070 [P] Confirm no competing UI libraries added in `frontend/package.json`
- [x] T071 Run `specs/002-login-authentication/quickstart.md` validation end-to-end and fix gaps
- [x] T072 [P] Extend CI if needed so auth unit/integration tests run in `.github/workflows/ci.yml` against Postgres
- [x] T073 Security review pass: sample logs from login/refresh/logout tests contain zero passwords/raw tokens (SC-008)
- [x] T074 Confirm Platform Foundation health, theme, loader, notifications still work after auth wiring (SC-009)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US2 (Phase 4)**: After US1 login path exists (extends failure mapping/rate limit on same endpoint)
- **US3 (Phase 5)**: After US1 (needs authenticated state); can overlap late US2
- **US4 (Phase 6)**: After US1 (+ ideally US3 for redirect-on-refresh-failure)
- **US5 (Phase 7)**: After US4 refresh endpoint + cookies
- **US6 (Phase 8)**: After refresh session model (US1/US4); can parallelize with US5 after logout API exists
- **Polish (Phase 9)**: After desired stories complete

### User Story Dependencies

| Story | Depends on | Independently testable after |
|-------|------------|------------------------------|
| US1 Sign in | Foundational | Seed login → home / `me` |
| US2 Safe failures | US1 login endpoint/UI | Invalid/inactive/429 paths |
| US3 Route protection | US1 auth state | Guards + returnUrl |
| US4 Refresh | US1 sessions | Refresh + interceptor |
| US5 Restore | US4 refresh + indicator cookie | Reload restore |
| US6 Logout | US1 (+ refresh cookie) | Logout + multi-session |

### Parallel Opportunities

- Phase 1: T002–T005 in parallel after T001 starts/completes packages
- Phase 2: T007/T009/T010/T013 parallel; T006 frontend contracts parallel with backend entities
- Within stories: all `[P]` test tasks parallel; US1 T022/T024/T025 parallel after contracts
- After Foundational: frontend Login UI (US1) can proceed while backend login handler finishes if API contract mocked—prefer sequential API-first for integration truth
- US5 and US6 can proceed in parallel once US4 refresh exists

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "Backend unit tests for password verify + JWT issue in backend/tests/ERP.UnitTests/Auth/"
Task: "Backend integration tests for POST /api/v1/auth/login in backend/tests/ERP.IntegrationTests/Auth/LoginTests.cs"
Task: "Frontend unit tests for login form validation in frontend/apps/shell/src/app/features/auth/login/"

# Implementation parallel slice:
Task: "Login use case in backend/src/ERP.Application/Auth/"
Task: "GET /api/v1/auth/me in AuthController.cs"
Task: "Auth API client in frontend/libs/core/src/lib/auth/auth-api.service.ts"
```

---

## Parallel Example: User Story 4

```bash
Task: "RefreshSession unit tests in backend/tests/ERP.UnitTests/Auth/RefreshSessionTests.cs"
Task: "Refresh integration tests in backend/tests/ERP.IntegrationTests/Auth/RefreshTests.cs"
Task: "Interceptor single-flight tests in frontend/libs/core/src/lib/auth/*.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational (**critical**)  
3. Complete Phase 3: US1 Sign in  
4. **STOP and VALIDATE** quickstart §4 + login integration tests  
5. Demo MVP authenticated Shell  

### Incremental Delivery

1. Setup + Foundational → auth platform ready  
2. US1 → MVP login  
3. US2 → safe failures + rate limit  
4. US3 → route guards + returnUrl  
5. US4 → refresh + interceptor  
6. US5 → session restore  
7. US6 → logout  
8. Polish → docs/CI/security/quickstart  

### Suggested MVP scope

**US1 only** (after Setup + Foundational): authenticatable login into Shell with JWT + refresh cookie. US2–US6 required for production-ready auth acceptance (spec §27).

---

## Notes

- [P] = different files, no incomplete-task dependencies
- Do not implement User Management, roles/permissions, MFA, SSO, or org context
- Do not store access/refresh tokens in `localStorage`
- Prefer replacing foundation placeholders over parallel auth stacks
- Commit after each task or logical group
- Verify tests fail before implementing where practical
