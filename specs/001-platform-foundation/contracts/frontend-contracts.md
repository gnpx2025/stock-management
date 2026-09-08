# Frontend Shared Contracts (Foundation)

TypeScript shapes for `frontend/libs/contracts` (names may follow Nx export conventions).

## AppConfig

```ts
export interface AppConfig {
  environmentName: 'Development' | 'Testing' | 'Staging' | 'Production';
  apiBaseUrl: string;
}
```

## HealthStatus

Align with [openapi.yaml](./openapi.yaml) `HealthStatus` / `ComponentHealth`.

## NotificationMessage

```ts
export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

export interface NotificationMessage {
  severity: NotificationSeverity;
  summary: string;
  detail?: string;
  lifeMs?: number;
}
```

## ThemeMode

```ts
export type ThemeMode = 'light' | 'dark';
```

## Auth placeholders

```ts
export interface AuthSession {
  // Intentionally empty / future fields only
}

export interface TokenStorage {
  getAccessToken(): string | null;
  clear(): void;
}
```

No login request/response DTOs in this feature.
