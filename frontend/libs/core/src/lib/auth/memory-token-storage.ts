import { Injectable } from '@angular/core';
import type { TokenStorage } from '@erp/contracts';

/** In-memory access-token store — never persists to localStorage/sessionStorage. */
@Injectable()
export class MemoryTokenStorage implements TokenStorage {
  private accessToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  clear(): void {
    this.accessToken = null;
  }
}
