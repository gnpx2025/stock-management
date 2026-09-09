# Frontend Auth Contracts

**Feature**: `002-login-authentication`  
TypeScript shapes for `frontend/libs/contracts` (replace foundation auth placeholders).

Align JSON field names with [openapi-auth.yaml](./openapi-auth.yaml).

## LoginRequest

```ts
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}
```

## AuthenticatedUser

```ts
export interface AuthenticatedUser {
  id: string;
  userName: string;
  email?: string | null;
}
```

## LoginResponse / RefreshResponse

```ts
export interface AuthTokenResponse {
  accessToken: string;
  expiresAt: string; // ISO-8601 UTC
  user: AuthenticatedUser;
}
```

Refresh uses the same response shape. Refresh token is **not** in the body.

## AuthSessionState

```ts
export type AuthStatus =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'refreshing'
  | 'signingOut';

export interface AuthSession {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  accessTokenExpiresAt: string | null;
}
```

## TokenStorage

```ts
export interface TokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string | null): void;
  clear(): void;
}
```

Memory-only implementation in `@erp/core` for this feature (no `localStorage`).

## Replaces foundation placeholders

Foundation empty `AuthSession` / stub `TokenStorage` are superseded by the shapes above. No contracts for roles, permissions, organizations, or user CRUD.
