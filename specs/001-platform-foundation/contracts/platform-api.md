# Platform API Contracts (Foundation)

**Base path (versioned)**: `/api/v1`  
**Ops health (unversioned)**: `/health`  
**Auth**: None required for foundation endpoints listed here.

## Endpoints

### GET `/api/v1/platform/health`

Shell-facing health aggregate used for foundation home and connectivity proof.

**Success response** `200 application/json`:

```json
{
  "status": "Healthy",
  "checkedAtUtc": "2026-09-08T12:00:00Z",
  "api": {
    "name": "api",
    "status": "Healthy",
    "description": "API is running"
  },
  "database": {
    "name": "database",
    "status": "Healthy",
    "description": "Database is reachable"
  },
  "correlationId": "00-abc123..."
}
```

**Status codes**:

- `200` when aggregate `status` is `Healthy` or `Degraded`
- `503` when aggregate `status` is `Unhealthy` (typically database unreachable)

**Headers**: Echo `X-Correlation-ID` (or equivalent) when provided by client; otherwise generate and return.

---

### GET `/health`

Ops/CI/Docker probe. May return ASP.NET Health Checks default or JSON writer payload.

- `200` — healthy  
- `503` — unhealthy (e.g. database down)

Optional siblings (recommended):

- `GET /health/live` — process up (no DB required)
- `GET /health/ready` — includes database check

---

### Problem Details (all unhandled / mapped errors)

`Content-Type: application/problem+json`

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "An error occurred",
  "status": 500,
  "detail": "Safe message",
  "instance": "/api/v1/example",
  "correlationId": "00-abc123..."
}
```

Validation failures SHOULD use `400` with an `errors` object of field → messages.

---

## CORS

Development MUST allow the Shell origin (e.g. `http://localhost:4200` or configured Nx port). Credentials not required for health.

## Out of scope

All business resources, auth token endpoints, and master-data routes.
