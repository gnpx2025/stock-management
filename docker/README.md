# Docker notes

## Postgres only (local `dotnet` + `nx serve`)

```bash
cp .env.example .env
docker compose up -d postgres
```

## Full stack (API + Shell + Postgres)

Builds the .NET API and Angular Shell images, then serves the app through nginx (static Shell + `/api` proxy).

```bash
cp .env.example .env
docker compose up -d --build
```

| Service  | URL |
|----------|-----|
| Shell    | http://localhost:8080 (or `WEB_PORT`) |
| API      | http://localhost:5080 (or `API_PORT`; optional direct access) |
| Postgres | localhost:`POSTGRES_PORT` (default 5432) |

From another machine on the LAN, open `http://<host-lan-ip>:8080`. Set `CORS_ORIGIN_0` to that origin if the browser talks to the API port directly (not needed for the nginx-proxied Shell).

Development containers run migrations and seed the admin user on API startup (`ASPNETCORE_ENVIRONMENT=Development`).

Default seed login: `admin` / `ChangeMe!DevOnly1`

```bash
docker compose logs -f api web
docker compose down
```

Do not commit real secrets.
