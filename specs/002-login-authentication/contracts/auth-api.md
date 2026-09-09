# Auth API Contracts

**Feature**: `002-login-authentication`  
**Base URL**: API host (local default `http://localhost:5080`)  
**Versioning**: URL segment `/api/v1/...`  
**Errors**: `application/problem+json` (Platform Foundation) + `correlationId`  
**Machine-readable**: [openapi-auth.yaml](./openapi-auth.yaml)

## Cross-cutting

| Concern | Contract |
|---------|----------|
| Credentials | Cookie auth for refresh: clients must send cookies (`credentials: include` / `withCredentials`) |
| Access token | `Authorization: Bearer <accessToken>` on protected endpoints |
| CORS | Allowed Shell origins + credentials enabled |
| Security | Never return password hashes, refresh token plaintext in JSON, or stack traces |

Generic login failure (invalid credentials **or** inactive user): **401** Problem Details with non-enumerating detail (e.g. “Invalid username or password.”).

Rate limited login: **429** Problem Details.

---

## Endpoints

### POST `/api/v1/auth/login`

Authenticate with username or email + password.

**Request**

```json
{
  "usernameOrEmail": "string",
  "password": "string"
}
```

**Responses**
- **200**: Access token + expiry + user summary; sets HttpOnly refresh cookie + session indicator cookie
- **401**: Generic authentication failure
- **429**: Rate limited
- **400**: Validation errors (missing fields)

Does **not** include refresh token in body.

---

### POST `/api/v1/auth/refresh`

Renew access token using refresh cookie. Rotates refresh token.

**Request**: empty body; cookies required.

**Responses**
- **200**: New access token + expiry + user summary; sets rotated refresh cookie
- **401**: Missing/invalid/expired/revoked/reused refresh (reuse also ends session family)
- **400**: Malformed request (rare)

Do **not** send Bearer access token (not required).

---

### POST `/api/v1/auth/logout`

Revoke **current** refresh session; clear auth cookies.

**Request**: empty body; cookies preferred. Should succeed in clearing client cookies even if access token expired.

**Responses**
- **204** (or **200** with empty body): logged out / cookies cleared
- Idempotent behavior preferred when already logged out (204)

---

### GET `/api/v1/auth/me`

Return minimal authenticated user for the Bearer access token.

**Responses**
- **200**: `{ "id", "userName", "email?" }`
- **401**: Missing/invalid/expired access token

---

## Status mapping (summary)

| Situation | Status |
|-----------|--------|
| Login success | 200 |
| Invalid or inactive credentials | 401 (generic) |
| Validation failure | 400 |
| Login rate limited | 429 |
| Refresh success | 200 |
| Refresh failure / reuse | 401 |
| Logout | 204 |
| me unauthorized | 401 |
| me success | 200 |
