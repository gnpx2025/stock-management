# ERP Platform

Monorepo foundation for the ERP application (Angular/Nx Shell + .NET Clean Architecture API + PostgreSQL).

## Prerequisites

- Node.js 20+ and npm
- .NET 10 SDK
- Docker (PostgreSQL via Compose)

```bash
# Prefer the arm64 user-profile SDK (Apple Silicon). Avoid /usr/local/share/dotnet/x64.
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$HOME/.dotnet:$HOME/.dotnet/tools:$PATH"
```

## Quick start

### Option A — Docker (API + Shell + Postgres)

```bash
cp .env.example .env
docker compose up -d --build
# → Shell http://localhost:8080  (LAN: http://<host-ip>:8080)
# → API   http://localhost:5080
```

See [docker/README.md](docker/README.md).

### Option B — Local processes (Postgres in Docker)

```bash
cp .env.example .env
docker compose up -d postgres

# Backend
cd backend
dotnet ef database update --project src/ERP.Infrastructure --startup-project src/ERP.Api
dotnet run --project src/ERP.Api
# → http://localhost:5080

# Frontend (new terminal)
cd frontend
npm install
npx nx serve shell
# → http://localhost:4200
```

## Documentation

- [Repository structure](docs/repository-structure.md)
- [Frontend architecture](docs/frontend-architecture.md)
- [Backend architecture](docs/backend-architecture.md)
- [Authentication / Login](docs/authentication.md)
- [Local development](docs/local-development.md)
- [Auth feature quickstart](specs/002-login-authentication/quickstart.md)
- [Platform foundation quickstart](specs/001-platform-foundation/quickstart.md)

## Spec Kit

Feature specs live under `specs/`. Active feature: `specs/002-login-authentication/`.

Default seed login (Development only; change immediately): `admin` / `ChangeMe!DevOnly1` — see [docs/authentication.md](docs/authentication.md).
