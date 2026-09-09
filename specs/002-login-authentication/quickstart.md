# Quickstart Validation: Login and Authentication

**Feature**: `002-login-authentication`  
**Purpose**: Prove login, session restore, refresh, route protection, and logout after implementation.  
**Related**: [contracts/auth-api.md](./contracts/auth-api.md), [data-model.md](./data-model.md), [research.md](./research.md)

## Prerequisites

- Platform Foundation already runnable (Postgres, API, Shell)
- Node.js LTS compatible with Angular 21+ / Nx
- .NET 10 SDK
- Docker for PostgreSQL
- Seed credentials configured via env/user-secrets (see below)—**never commit real passwords**

## 1. Configure auth secrets

1. Ensure `.env` / user-secrets include at least:
   - JWT signing key (long random secret)
   - Seed username/email + password for Development/Testing
2. Confirm CORS allowed origins include Shell (`http://localhost:4200`) and credentials are enabled after implementation.
3. Confirm Shell `apiBaseUrl` still points at the API (`http://localhost:5080`).

**Expected**: Examples in `.env.example` / appsettings examples only; no production secrets in git.

## 2. Start infrastructure & migrate

```bash
docker compose up -d
# From backend (exact paths per README)
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
dotnet run --project src/ERP.Api
```

**Expected**: Migrations apply `AuthUser` / `RefreshSession`; API starts; seed user present in Dev/Testing when configured.

## 3. Start Shell

```bash
# From frontend
npx nx serve shell
```

**Expected**: Opening the app while logged out redirects to `/login` (no protected Shell flash).

## 4. Login success path

1. Open `http://localhost:4200/login` (or any protected route → redirect).
2. Submit seed credentials.
3. Confirm redirect to home or preserved safe `returnUrl`.
4. Confirm Shell chrome is visible; call or observe authenticated behavior (e.g. `GET /api/v1/auth/me` succeeds with Bearer).

**Expected**: Authenticated within SC-002 budget; access token not in `localStorage`; refresh cookie present as HttpOnly.

## 5. Invalid / inactive credentials

1. Login with wrong password → generic error; stay on Login.
2. If an inactive test user exists, login with correct password → **same** generic error.

**Expected**: No account-existence hints in the UI.

## 6. Route protection & return URL

1. While logged out, navigate to a protected deep link (e.g. foundation home path).
2. After successful login, land on that path (not an external URL).
3. While logged in, open `/login` → redirect to authenticated entry.

## 7. Session restore

1. Login successfully.
2. Full browser refresh.
3. Confirm session restores without re-entering credentials (indicator cookie + silent refresh).

**Expected**: No protected Shell content before auth resolution completes.

## 8. Refresh coordination (dev/test)

1. Shorten access token lifetime in config for a local trial, or wait for expiry in test harness.
2. Trigger concurrent authenticated API calls after expiry.
3. Confirm a single refresh and successful retries; user stays signed in.

## 9. Logout

1. Logout from Shell.
2. Confirm redirect to `/login`, cookies cleared, protected routes redirect, `me` returns 401.
3. With two browsers logged in as same user, logout one → the other remains authenticated.

## 10. Automated checks

```bash
# Frontend unit tests (auth-related projects)
npx nx test core
npx nx test shell
# Backend
dotnet test
```

**Expected**: Auth unit + integration tests pass; foundation health/architecture tests still pass; CI green with Postgres.

## 11. Security smoke

- Inspect API logs around login/refresh/logout: no passwords or raw tokens.
- Confirm Problem Details for failures omit sensitive internals.

## Done when

Acceptance criteria in [spec.md](./spec.md) §27 are demonstrable via the steps above and automated tests.
