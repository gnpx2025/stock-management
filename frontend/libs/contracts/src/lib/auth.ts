/** Placeholder for future authenticated session state. */
export interface AuthSession {
  // Intentionally empty — Login / JWT are out of scope for Platform Foundation.
}

/** Placeholder abstraction for token persistence. */
export interface TokenStorage {
  getAccessToken(): string | null;
  clear(): void;
}
