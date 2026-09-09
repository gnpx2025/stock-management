import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AuthenticatedUser,
  AuthTokenResponse,
  LoginRequest,
} from '@erp/contracts';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { SKIP_ERROR_NOTIFICATION_HEADER } from '../http/error-notification.interceptor';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get baseUrl(): string {
    return `${this.config.apiBaseUrl}/api/v1/auth`;
  }

  login(request: LoginRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.baseUrl}/login`, request, {
      withCredentials: true,
      headers: this.quietErrorHeaders(),
    });
  }

  refresh(): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(
      `${this.baseUrl}/refresh`,
      {},
      {
        withCredentials: true,
        headers: this.quietErrorHeaders(),
      },
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, {
      withCredentials: true,
    });
  }

  me(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(`${this.baseUrl}/me`, {
      withCredentials: true,
    });
  }

  /** Inline auth errors; still use Shell global loader for login/refresh. */
  private quietErrorHeaders(): HttpHeaders {
    return new HttpHeaders({
      [SKIP_ERROR_NOTIFICATION_HEADER]: '1',
    });
  }
}
