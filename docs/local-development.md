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

## 2. Full stack in Docker (optional)

Builds and runs Postgres, API, and Shell (nginx):

```bash
docker compose up -d --build
```

- App: **http://localhost:8080** (other machines: `http://<host-lan-ip>:8080`)
- API: **http://localhost:5080**
- Details: [docker/README.md](../docker/README.md)

Stop host `dotnet run` / `nx serve` first if ports `5080` / `8080` are already in use, or change `API_PORT` / `WEB_PORT` in `.env`.

## 3. PostgreSQL only (local API + Shell)

```bash
docker compose up -d postgres
```

## 4. Backend

```bash
cd backend
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
dotnet run --project src/ERP.Api
```

API listens on **http://localhost:5080** (see `launchSettings.json`).

Smoke:

- http://localhost:5080/health/live
- http://localhost:5080/api/v1/platform/health

## 5. Frontend

```bash
cd frontend
npm install
npx nx serve shell
```

Open the Shell URL (typically http://localhost:4200). Foundation home shows API health, theme toggle, and demo loader/toasts.

Runtime API URL: `frontend/apps/shell/public/config.json`.

## 6. Tests

```bash
# Frontend
cd frontend
npm run check:ui-libs
npx nx run-many -t lint,test,build --projects=shell,core,ui,i18n,shared,contracts

# Backend
cd backend
dotnet test
```

## Acceptance

Follow [specs/001-platform-foundation/quickstart.md](../specs/001-platform-foundation/quickstart.md).
