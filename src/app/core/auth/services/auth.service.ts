import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../api/api.constants';
import { AuthStore } from '../auth.store';
import { LoginRequest, LoginResponse } from '../models/auth-response.model';
import { LoggerService } from '../../services/logger.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}${API_ENDPOINTS.auth.login}`, request)
      .pipe(
        tap((res) => this.store.setSession(res)),
        catchError((err) => {
          this.logger.warn('Login failed', { status: err?.status });
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    // Best-effort server-side revoke; UI state clears regardless of the result.
    this.http.post(`${environment.apiBaseUrl}${API_ENDPOINTS.auth.logout}`, {}).subscribe({
      complete: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.store.clear();
    this.router.navigateByUrl('/login');
  }
}
