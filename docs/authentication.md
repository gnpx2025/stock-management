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
| Access (JWT) | Frontend memory only | Default 15 minutes; Bearer header |
| Refresh | HttpOnly cookie `erp_refresh` | Rotated on each refresh; hashed server-side |
| Indicator | Non-HttpOnly `erp_auth=1` | Lets Shell skip silent refresh when absent |

## Cookie / CORS

- Development (via Shell proxy): `SameSite=Lax`, `Secure=false`, `apiBaseUrl=""`.
- Production: HTTPS required; set `Authentication:Refresh:Secure=true`, prefer `SameSite=Lax` behind same-site reverse proxy, or `None` only with Secure when Shell and API are cross-site. Enable CORS `AllowCredentials` with explicit origins (never `*`).

## Rate limiting

`POST /api/v1/auth/login` is limited to 10 attempts / minute / IP. No account lockout.

## APIs

See `specs/002-login-authentication/contracts/auth-api.md`.
