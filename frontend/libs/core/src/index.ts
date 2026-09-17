import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
  inject,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import type { AppConfig } from '@erp/contracts';
import { APP_CONFIG } from './lib/config/app-config';
import { AuthSessionService } from './lib/auth/auth-session.service';
import { MemoryTokenStorage } from './lib/auth/memory-token-storage';
import { TOKEN_STORAGE } from './lib/auth/token-storage.token';
import { authInterceptor } from './lib/auth/auth.interceptor';
import { correlationIdInterceptor } from './lib/http/correlation-id.interceptor';
import { credentialsInterceptor } from './lib/http/credentials.interceptor';
import { errorNotificationInterceptor } from './lib/http/error-notification.interceptor';
import { loadingInterceptor } from './lib/http/loading.interceptor';

export function provideErpCore(config: AppConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: APP_CONFIG, useValue: config },
    { provide: TOKEN_STORAGE, useClass: MemoryTokenStorage },
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationIdInterceptor,
        credentialsInterceptor,
        authInterceptor,
        loadingInterceptor,
        errorNotificationInterceptor,
      ]),
    ),
    provideAppInitializer(() => {
      const session = inject(AuthSessionService);
      return session.restoreFromRefresh();
    }),
  ]);
}

export { APP_CONFIG, DEFAULT_APP_CONFIG, loadAppConfig, isAppConfig } from './lib/config/app-config';
export { LoadingService } from './lib/http/loading.service';
export {
  CORRELATION_ID_HEADER,
  correlationIdInterceptor,
  createCorrelationId,
} from './lib/http/correlation-id.interceptor';
export {
  SKIP_LOADING_HEADER,
  loadingInterceptor,
} from './lib/http/loading.interceptor';
export {
  SKIP_ERROR_NOTIFICATION_HEADER,
  errorNotificationInterceptor,
} from './lib/http/error-notification.interceptor';
export { credentialsInterceptor } from './lib/http/credentials.interceptor';
export {
  PlatformHealthService,
  summarizeHealth,
  isPlatformHealthy,
} from './lib/http/platform-health.service';
export {
  NOTIFICATION_HANDLER,
  type NotificationHandler,
} from './lib/notifications/notification-handler';
export { TOKEN_STORAGE } from './lib/auth/token-storage.token';
export { MemoryTokenStorage } from './lib/auth/memory-token-storage';
export { AuthApiService } from './lib/auth/auth-api.service';
export { AuthSessionService } from './lib/auth/auth-session.service';
export {
  authInterceptor,
  AUTH_RETRIED,
} from './lib/auth/auth.interceptor';
export { authGuard, guestGuard } from './lib/auth/auth.guard';
export { safeReturnUrl } from './lib/auth/return-url';
export {
  AUTH_INDICATOR_COOKIE,
  AUTH_HINT_STORAGE_KEY,
  hasAuthIndicatorCookie,
  hasAuthSessionHint,
  shouldAttemptSessionRestore,
  setAuthSessionHint,
  clearAuthSessionHint,
} from './lib/auth/auth-indicator';
export { AppContextService } from './lib/context/app-context.service';
