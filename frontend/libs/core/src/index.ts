import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import type { AppConfig } from '@erp/contracts';
import { APP_CONFIG } from './lib/config/app-config';
import { correlationIdInterceptor } from './lib/http/correlation-id.interceptor';
import { errorNotificationInterceptor } from './lib/http/error-notification.interceptor';
import { loadingInterceptor } from './lib/http/loading.interceptor';

export function provideErpCore(config: AppConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: APP_CONFIG, useValue: config },
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        loadingInterceptor,
        errorNotificationInterceptor,
      ]),
    ),
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
export { errorNotificationInterceptor } from './lib/http/error-notification.interceptor';
export {
  PlatformHealthService,
  summarizeHealth,
  isPlatformHealthy,
} from './lib/http/platform-health.service';
export {
  NOTIFICATION_HANDLER,
  type NotificationHandler,
} from './lib/notifications/notification-handler';
export {
  AuthSessionService,
  NullTokenStorage,
} from './lib/auth/auth-placeholders';
export { allowAllGuard } from './lib/auth/allow-all.guard';
export { AppContextService } from './lib/context/app-context.service';
