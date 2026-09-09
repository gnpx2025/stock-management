import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import type { AuthTokenResponse } from '@erp/contracts';
import { APP_CONFIG } from '../config/app-config';
import { AuthApiService } from './auth-api.service';
import { AuthSessionService } from './auth-session.service';
import { TOKEN_STORAGE } from './token-storage.token';

/** Marks a request that already retried once after refresh. */
export const AUTH_RETRIED = new HttpContextToken<boolean>(() => false);

let refreshInFlight$: Observable<AuthTokenResponse> | null = null;

function isAuthLoginOrRefresh(url: string, apiBaseUrl: string): boolean {
  const authBase = `${apiBaseUrl}/api/v1/auth`;
  return (
    url.startsWith(`${authBase}/login`) || url.startsWith(`${authBase}/refresh`)
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  const tokenStorage = inject(TOKEN_STORAGE);
  const session = inject(AuthSessionService);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(config.apiBaseUrl);
  const skipAuthAttach = isAuthLoginOrRefresh(req.url, config.apiBaseUrl);

  let outgoing = req;
  if (isApiRequest && !skipAuthAttach) {
    const token = tokenStorage.getAccessToken();
    if (token && !req.headers.has('Authorization')) {
      outgoing = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !isApiRequest ||
        skipAuthAttach ||
        outgoing.context.get(AUTH_RETRIED)
      ) {
        return throwError(() => error);
      }

      // Logout 401: clear locally without attempting refresh.
      if (outgoing.url.startsWith(`${config.apiBaseUrl}/api/v1/auth/logout`)) {
        session.clear();
        return throwError(() => error);
      }

      if (!refreshInFlight$) {
        session.status.set('refreshing');
        refreshInFlight$ = authApi.refresh().pipe(
          shareReplay(1),
          finalize(() => {
            refreshInFlight$ = null;
          }),
        );
      }

      return refreshInFlight$.pipe(
        switchMap((response) => {
          session.applyTokenResponse(response);
          const token = tokenStorage.getAccessToken();
          const retry = outgoing.clone({
            context: outgoing.context.set(AUTH_RETRIED, true),
            setHeaders: token
              ? { Authorization: `Bearer ${token}` }
              : undefined,
          });
          return next(retry);
        }),
        catchError((refreshError: unknown) => {
          session.clear();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
