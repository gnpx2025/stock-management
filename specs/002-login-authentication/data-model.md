# Data Model: Login and Authentication

**Feature**: `002-login-authentication` | **Date**: 2026-09-08

Persistence adds only what is required to authenticate users and manage refresh sessions. Designed so future User Management can extend identity without a full redesign (stable user id, unique login identifiers, active flag).

---

## Persistence (EF Core / PostgreSQL)

### AuthUser

Minimal authenticatable identity. **Not** a full user-management aggregate.

| Field | Type | Rules |
|-------|------|-------|
| Id | uuid (PK) | Stable identifier; used as JWT `sub` |
| UserName | string | Required; unique (case-insensitive collation or normalized form) |
| Email | string? | Optional at this stage; if present, unique (case-insensitive / normalized) |
| NormalizedUserName | string | Required; unique; used for lookup |
| NormalizedEmail | string? | Unique when not null |
| PasswordHash | string | Required; ASP.NET Identity-compatible hash; never plaintext |
| IsActive | bool | Default true; inactive users cannot authenticate |
| CreatedAtUtc | timestamptz | Required |
| UpdatedAtUtc | timestamptz | Required |

**Indexes / constraints**:
- Unique on `NormalizedUserName`
- Unique filtered index on `NormalizedEmail` where not null
- No role/permission tables

**Lookup**: Login accepts a single identifier; resolve by normalized username **or** normalized email match.

**Relationships**: One `AuthUser` has many `RefreshSession` rows.

---

### RefreshSession

Server-side refresh session / session family tracking.

| Field | Type | Rules |
|-------|------|-------|
| Id | uuid (PK) | Session row id |
| UserId | uuid (FK → AuthUser) | Required; cascade or restrict per platform norm (prefer restrict + explicit revoke) |
| FamilyId | uuid | Required; shared across rotated tokens in one login chain |
| TokenHash | string | Required; hash/verifier of current refresh token only (never plaintext token) |
| CreatedAtUtc | timestamptz | Required |
| ExpiresAtUtc | timestamptz | Required; absolute expiry |
| RevokedAtUtc | timestamptz? | Set on logout, rotation replace, or family revoke |
| ReplacedBySessionId | uuid? | Optional link to successor row after rotation |
| CreatedByIp | string? | Optional; for security logging / rate-limit correlation |
| UserAgent | string? | Optional; truncated |

**Indexes / constraints**:
- Index on `UserId`
- Index on `FamilyId`
- Index on `TokenHash` (unique among non-revoked current tokens, or unique globally per hash)
- Query path: lookup by hash → validate not revoked, not expired, user active

**Lifecycle**:
1. **Login** → create new `FamilyId`, insert session with token hash, set cookies.
2. **Refresh** → validate hash; insert new session row (same `FamilyId`) with new hash; revoke prior row (`RevokedAtUtc`, `ReplacedBySessionId`); set new cookie.
3. **Reuse of revoked/rotated token** → revoke **all** sessions with that `FamilyId`; deny refresh.
4. **Logout** → revoke current session (by cookie hash); clear cookies. Other families for same user remain.
5. **Inactive user** → deny login/refresh; optionally revoke sessions on refresh attempt.

---

## Runtime / non-persisted models

### AccessToken (JWT)

| Claim / field | Rules |
|---------------|-------|
| sub | AuthUser.Id |
| preferred_username or name | UserName |
| email | Email when present |
| jti | Unique token id |
| exp / iat / iss / aud | Standard JWT; lifetime from config (default 15m) |

Not persisted. Held in frontend memory only.

---

### Authentication cookies

| Cookie | HttpOnly | Purpose |
|--------|----------|---------|
| Refresh cookie (e.g. `erp_refresh`) | Yes | Opaque refresh token |
| Session indicator (e.g. `erp_auth`) | No | Non-secret flag for bootstrap “maybe restore” |

Both cleared on logout / failed restore. Secure/SameSite per environment (see [research.md](./research.md)).

---

### Client AuthenticationState

| State | Meaning |
|-------|---------|
| Unauthenticated | No usable session |
| Authenticating | Login in progress |
| Authenticated | Access token in memory; user summary known |
| Refreshing | Single-flight refresh in progress |
| SigningOut | Logout in progress |

Expose minimal `AuthenticatedUser` summary: `id`, `userName`, optional `email`.

---

## Validation rules (auth)

| Rule | Enforcement |
|------|-------------|
| Username/email + password required on login | Client + server |
| Password never logged or returned | Server + logging policy |
| Inactive or bad credentials → same generic client error | Application mapping |
| Refresh requires valid non-revoked non-expired hash + active user | Application |
| Return URL must be relative same-app path | Frontend guard |

---

## Out of scope tables

Roles, permissions, user profiles, organizations, branches, password-reset tokens, MFA devices—**not** created in this feature.
