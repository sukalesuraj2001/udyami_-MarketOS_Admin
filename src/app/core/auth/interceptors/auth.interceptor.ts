import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth.store';
import { API_ENDPOINTS } from '../../api/api.constants';

const isAuthEndpoint = (url: string): boolean =>
  url.includes(API_ENDPOINTS.auth.login) || url.includes(API_ENDPOINTS.auth.logout);

/**
 * Attaches the bearer token to every outgoing request. The backend issues a
 * single long-lived access token (no refresh token) — on a 401 we just clear
 * the session and bounce to /login rather than attempting a silent refresh.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  const token = store.accessToken();
  const authorizedReq = token && !isAuthEndpoint(req.url)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      const is401 = error instanceof HttpErrorResponse && error.status === 401;
      if (is401 && !isAuthEndpoint(req.url)) {
        store.clear();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
