# Quickstart Validation: Platform Foundation

**Feature**: `001-platform-foundation`  
**Purpose**: Prove the foundation works end-to-end after implementation.  
**Related**: [contracts/platform-api.md](./contracts/platform-api.md), [data-model.md](./data-model.md), [research.md](./research.md)

## Prerequisites

- Node.js LTS compatible with Angular 21+ / Nx (see README after implement)
- .NET 10 SDK
- Docker Desktop (or equivalent) for PostgreSQL
- Git

## 1. Configure environment

1. Copy example env files (paths finalized in README):
   - Root / Docker: `.env.example` → `.env`
   - Backend user-secrets or `appsettings.Development.json` (local only; not committed with secrets)
2. Confirm Postgres credentials match Compose and API connection string.
3. Confirm Shell `apiBaseUrl` points at the local API.

**Expected**: No production secrets in git; examples only in repo.

## 2. Start PostgreSQL

```bash
docker compose up -d
```

**Expected**: Container healthy; volume persists data across restarts.

## 3. Apply migrations & start API

```bash
# From backend solution directory (exact commands in README)
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
dotnet run --project src/ERP.Api
```

**Expected**:
- API listens on configured URL/port
- `GET /health/live` → 200
- `GET /health/ready` and `GET /api/v1/platform/health` → healthy when DB is up (see [openapi.yaml](./contracts/openapi.yaml))

## 4. Start Shell

```bash
# From frontend/
npm install   # or pnpm/yarn per README
npx nx serve shell
```

**Expected**:
- Minimal layout chrome (header/sidebar/content)
- Foundation home shows API health status via browser call
- Default theme light (OS preference respected when practical)
- Light/dark switch works
- Demo controls trigger global loader and toast notifications

## 5. Connectivity & failure checks

| Step | Action | Expected |
|------|--------|----------|
| A | Shell loads with API up | Health shows Healthy; network call succeeds (CORS OK) |
| B | Stop Postgres; hit ready/platform health | Unhealthy/503; logs include correlation ID; no secrets in response |
| C | Stop API; use Shell demo/error path | User-friendly notification via centralized handler |
| D | Trigger sample error endpoint or forced exception (if provided for foundation diagnostics) | Problem Details + matching correlation ID in logs |

## 6. Quality gates (local)

```bash
# Frontend (exact Nx targets in README)
npx nx run-many -t lint,test,build --projects=shell,core,ui,shared,contracts

# Backend
dotnet build
dotnet test
```

**Expected**: All pass. Architecture tests fail if Domain references Infrastructure/Api.

## 7. CI shape (verify in repo)

Confirm `.github/workflows/ci.yml` (or equivalent) runs:

`install → lint → typecheck → build → unit tests → integration tests`

with backend integration tests against a **real PostgreSQL** service.

## Acceptance mapping

| Criterion | Validated by |
|-----------|--------------|
| SC-001 | Steps 1–4 under ~30 minutes with README |
| SC-002, SC-013 | Step 4 theme + chrome + demos |
| SC-003, SC-004 | Steps 3 and 5B |
| SC-005 | Step 6 + CI |
| SC-011 | Step 5A |
| SC-012 | Step 5D |
| SC-009, SC-010 | Dependency review + no Login/business entities |

## Out of scope for this quickstart

Login, JWT, master data, finance, inventory, purchasing, sales, reports, deployment.
