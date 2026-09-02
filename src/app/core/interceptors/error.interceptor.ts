import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { LoggerService } from '../services/logger.service';
import { API_ENDPOINTS } from '../api/api.constants';

const FRIENDLY_MESSAGES: Record<number, string> = {
  400: 'That request was not valid. Please check the form and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'That change conflicts with the current state. Please refresh and retry.',
  422: 'Some of the information provided is not valid.',
  429: 'Too many requests. Please try again shortly.',
  500: 'Something went wrong on the server.',
  503: 'Service temporarily unavailable. Please try again soon.',
};

/**
 * Central place API errors become user-facing toasts. Feature services do
 * NOT need their own error handling for the common cases — they can still
 * catchError locally for anything screen-specific.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        logger.error(`HTTP ${error.status} on ${req.method} ${req.url}`, { body: error.error });

        // 401 on a non-auth endpoint is handled by the auth interceptor
        // (session clear + redirect to /login) — don't also toast it here.
        const isAuthEndpoint = req.url.includes(API_ENDPOINTS.auth.login);
        if (error.status !== 401 || isAuthEndpoint) {
          const message = FRIENDLY_MESSAGES[error.status] ?? 'Unexpected error. Please try again.';
          notifications.error('Request failed', message);
        }
      }
      return throwError(() => error);
    }),
  );
};
