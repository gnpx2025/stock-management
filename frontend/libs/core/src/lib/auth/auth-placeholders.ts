import { Injectable } from '@angular/core';
import type { AuthSession, TokenStorage } from '@erp/contracts';

/** No-op token storage placeholder — Login is out of scope. */
@Injectable({ providedIn: 'root' })
export class NullTokenStorage implements TokenStorage {
  getAccessToken(): string | null {
    return null;
  }

  clear(): void {
    // no-op
  }
}

/** Auth session placeholder service — no Login / JWT logic. */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private session: AuthSession | null = null;

  getSession(): AuthSession | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return false;
  }
}
