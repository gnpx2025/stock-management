import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type {
  AuthenticatedUser,
  AuthStatus,
  AuthTokenResponse,
  LoginRequest,
} from '@erp/contracts';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';
import { AuthApiService } from './auth-api.service';
import {
  clearAuthSessionHint,
  setAuthSessionHint,
  shouldAttemptSessionRestore,
} from './auth-indicator';
import { TOKEN_STORAGE } from './token-storage.token';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(AuthApiService);
  private readonly tokenStorage = inject(TOKEN_STORAGE);
  private readonly router = inject(Router);

  readonly status = signal<AuthStatus>('unauthenticated');
  readonly user = signal<AuthenticatedUser | null>(null);
  readonly accessTokenExpiresAt = signal<string | null>(null);

  isAuthenticated(): boolean {
    return this.status() === 'authenticated' && !!this.tokenStorage.getAccessToken();
  }

  applyTokenResponse(response: AuthTokenResponse): void {
    this.tokenStorage.setAccessToken(response.accessToken);
    this.user.set(response.user);
    this.accessTokenExpiresAt.set(response.expiresAt);
    this.status.set('authenticated');
    setAuthSessionHint();
  }

  clear(): void {
    this.tokenStorage.clear();
    this.user.set(null);
    this.accessTokenExpiresAt.set(null);
    this.status.set('unauthenticated');
    clearAuthSessionHint();
  }

  login(request: LoginRequest): Observable<AuthTokenResponse> {
    this.status.set('authenticating');
    return this.api.login(request).pipe(
      tap((response) => this.applyTokenResponse(response)),
      catchError((error: unknown) => {
        this.clear();
        return throwError(() => error);
      }),
    );
  }

  logout(): Observable<void> {
    this.status.set('signingOut');
    return this.api.logout().pipe(
      catchError(() => of(undefined)),
      map(() => undefined),
      finalize(() => {
        this.clear();
        void this.router.navigateByUrl('/login');
      }),
    );
  }

  /**
   * Silent session restore when a same-origin indicator cookie or client hint is present.
   * Skips the network call when both are absent.
   */
  restoreFromRefresh(): Promise<void> {
    if (!shouldAttemptSessionRestore()) {
      return Promise.resolve();
    }

    this.status.set('refreshing');
    return firstValueFrom(
      this.api.refresh().pipe(
        tap((response) => this.applyTokenResponse(response)),
        map(() => undefined),
        catchError(() => {
          this.clear();
          return of(undefined);
        }),
      ),
    );
  }
}
