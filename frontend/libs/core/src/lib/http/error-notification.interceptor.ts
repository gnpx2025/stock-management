import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NOTIFICATION_HANDLER } from '../notifications/notification-handler';
import { CORRELATION_ID_HEADER } from './correlation-id.interceptor';

export const SKIP_ERROR_NOTIFICATION_HEADER = 'X-Skip-Error-Notification';

function extractProblemDetail(error: HttpErrorResponse): string | undefined {
  const body = error.error;
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const detail = (body as { detail?: unknown }).detail;
  return typeof detail === 'string' ? detail : undefined;
}

export const errorNotificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NOTIFICATION_HANDLER, { optional: true });
  const skipNotification = req.headers.has(SKIP_ERROR_NOTIFICATION_HEADER);
  const cleaned = skipNotification
    ? req.clone({
        headers: req.headers.delete(SKIP_ERROR_NOTIFICATION_HEADER),
      })
    : req;

  return next(cleaned).pipe(
    catchError((error: unknown) => {
      if (
        !skipNotification &&
        error instanceof HttpErrorResponse &&
        notifications
      ) {
        const correlationId =
          error.headers?.get(CORRELATION_ID_HEADER) ??
          (typeof error.error === 'object' &&
          error.error &&
          'correlationId' in error.error
            ? String((error.error as { correlationId: unknown }).correlationId)
            : undefined);

        const detail =
          extractProblemDetail(error) ??
          error.message ??
          `HTTP ${error.status}`;

        notifications.show({
          severity: 'error',
          summary: 'Request failed',
          detail: correlationId
            ? `${detail} (correlation: ${correlationId})`
            : detail,
          lifeMs: 8000,
        });
      }
      return throwError(() => error);
    }),
  );
};
