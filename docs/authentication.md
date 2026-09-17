# Authentication

Login and session handling for the ERP Shell (feature `002-login-authentication`).

## Local development

1. Configure Postgres via `.env` / `docker compose up -d`.
2. JWT + seed defaults live in `backend/src/ERP.Api/appsettings.json` for Development only. Override with env vars / user-secrets:

```bash
Authentication__Jwt__SigningKey=<long-random-secret-32+>
Authentication__Seed__UserName=admin
Authentication__Seed__Password=<local-secret>
```

3. Start API: `dotnet run --project backend/src/ERP.Api`
4. Start Shell: `npx nx serve shell` (proxies `/api` → `http://localhost:5080` so refresh cookies stay same-site).
5. Open `http://localhost:4200/login` and sign in with the seed user.

## Token strategy

| Token | Storage | Notes |
|-------|---------|-------|
| Access (JWT) | Frontend memory only | Default 15 minutes; Bearer header. **Not** stored in `localStorage`. |
| Refresh | HttpOnly cookie `erp_refresh` | Rotated on each refresh; hashed server-side |
| Indicator | Non-HttpOnly `erp_auth=1` | Lets Shell skip silent refresh when absent (same-origin / proxied Shell) |
| Client hint | `localStorage['erp.authHint']=1` | Non-secret flag so cross-origin Shell still attempts silent refresh after reload |

## Cookie / CORS

- Development (via Shell proxy): `SameSite=Lax`, `Secure=false`, `apiBaseUrl=""`.
- Production: HTTPS required; set `Authentication:Refresh:Secure=true`, prefer `SameSite=Lax` behind same-site reverse proxy, or `None` only with Secure when Shell and API are cross-site. Enable CORS `AllowCredentials` with explicit origins (never `*`).
- Cross-origin Render (UI and API on different `*.onrender.com` hosts): allow the Shell origin in `Cors:AllowedOrigins`, set `Authentication:Refresh:SameSite=None` and `Secure=true`, and point Shell `apiBaseUrl` at the API HTTPS URL. The API also emits `Partitioned` on those cookies (CHIPS) so browsers can keep the refresh cookie for the Shell top-level site. Defaults live in `appsettings.Production.json`; override on the host with:

```bash
Cors__AllowedOrigins__0=https://stock-management-ui-dw2a.onrender.com
Authentication__Refresh__SameSite=None
Authentication__Refresh__Secure=true
```

Shell `apiBaseUrl` for this deploy: `https://stock-management-a48d.onrender.com`.

**Preferred production shape** (matches Docker/nginx): serve Shell and `/api` on the **same origin** (`apiBaseUrl: ""`) so refresh cookies are first-party. Separate UI/API hosts rely on cross-site cookies and are more fragile.
## Render (API) required env vars

The API image does **not** ship a production database URL. Without these, login tries `127.0.0.1:5432` and fails.

1. Create a **Render PostgreSQL** instance (or use an existing one).
2. On the **API** web service, set:

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=<render-pg-host>;Port=5432;Database=<db>;Username=<user>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true
Cors__AllowedOrigins__0=https://stock-management-ui-dw2a.onrender.com
Authentication__Refresh__SameSite=None
Authentication__Refresh__Secure=true
Authentication__Jwt__SigningKey=<long-random-secret-32+>
Authentication__Seed__UserName=admin
Authentication__Seed__Email=admin@example.com
Authentication__Seed__Password=<strong-secret>
```

Use the **Internal** Database host when the API and Postgres are in the same Render region. Prefer Npgsql key/value form above; a `postgresql://…` URL from Render often works with recent Npgsql as well.

3. Redeploy the API. Startup applies EF migrations; seed runs when `Authentication__Seed__*` is set.

## Rate limiting

`POST /api/v1/auth/login` is limited to 10 attempts / minute / IP. No account lockout.

## APIs

See `specs/002-login-authentication/contracts/auth-api.md`.
