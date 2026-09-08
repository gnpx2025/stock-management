# Local development

## Prerequisites

- Node.js 20+ / npm
- .NET 10 SDK (`dotnet --version`)
- Docker (for PostgreSQL)

If the SDK was installed via the user-home script:

```bash
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$HOME/.dotnet:$PATH"
```

## 1. Environment

```bash
cp .env.example .env
```

## 2. PostgreSQL

```bash
docker compose up -d
```

## 3. Backend

```bash
cd backend
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
dotnet run --project src/ERP.Api
```

API listens on **http://localhost:5080** (see `launchSettings.json`).

Smoke:

- http://localhost:5080/health/live
- http://localhost:5080/api/v1/platform/health

## 4. Frontend

```bash
cd frontend
npm install
npx nx serve shell
```

Open the Shell URL (typically http://localhost:4200). Foundation home shows API health, theme toggle, and demo loader/toasts.

Runtime API URL: `frontend/apps/shell/public/config.json`.

## 5. Tests

```bash
# Frontend
cd frontend
npm run check:ui-libs
npx nx run-many -t lint,test,build --projects=shell,core,ui,shared,contracts

# Backend
cd backend
dotnet test
```

## Acceptance

Follow [specs/001-platform-foundation/quickstart.md](../specs/001-platform-foundation/quickstart.md).
