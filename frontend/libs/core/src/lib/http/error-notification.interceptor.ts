import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NOTIFICATION_HANDLER } from '../notifications/notification-handler';
import { CORRELATION_ID_HEADER } from './correlation-id.interceptor';

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

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && notifications) {
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
