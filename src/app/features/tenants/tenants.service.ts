import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';
import { DigitalUser, DigitalUserSummary, Tenant } from '../../core/models/domain.model';

export interface ProvisionTenantRequest {
  businessName: string;
  gstNumber: string;
  plan: string;
  ownerEmail: string;
}

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Backend returns { count, users } — no ApiResponse envelope. */
  list(): Observable<DigitalUser[]> {
    return this.http
      .get<DigitalUserSummary>(`${this.base}${API_ENDPOINTS.tenants.root}`)
      .pipe(map((res) => res.users));
  }
  provision(request: ProvisionTenantRequest): Observable<Tenant> {
    return this.http
      .post<ApiResponse<Tenant>>(`${this.base}${API_ENDPOINTS.tenants.root}`, request)
      .pipe(map((res) => res.data));
  }

  suspend(id: string, reason: string): Observable<Tenant> {
    return this.http
      .post<ApiResponse<Tenant>>(`${this.base}${API_ENDPOINTS.tenants.suspend(id)}`, { reason })
      .pipe(map((res) => res.data));
  }

  requestImpersonationConsent(id: string, reason: string, sessionMinutes: number): Observable<{ requested: boolean }> {
    return this.http
      .post<ApiResponse<{ requested: boolean }>>(`${this.base}${API_ENDPOINTS.tenants.impersonationRequest(id)}`, { reason, sessionMinutes })
      .pipe(map((res) => res.data));
  }
}
