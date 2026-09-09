export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  userName: string;
  email?: string | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  expiresAt: string; // ISO-8601 UTC
  user: AuthenticatedUser;
}

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

export interface TokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string | null): void;
  clear(): void;
}
