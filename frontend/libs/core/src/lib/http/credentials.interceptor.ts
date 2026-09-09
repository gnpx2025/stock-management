import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

/** Ensure credentialed cookies are sent on API requests (refresh cookie). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  if (!req.url.startsWith(config.apiBaseUrl)) {
    return next(req);
  }

  if (req.withCredentials) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
