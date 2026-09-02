import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';
import { FeatureFlag } from '../../core/models/domain.model';

export interface FeatureFlagsResponse {
  tenantName: string;
  flags: FeatureFlag[];
}

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getForTenant(tenantName: string): Observable<FeatureFlagsResponse> {
    const params = new HttpParams().set('tenant', tenantName);
    return this.http
      .get<ApiResponse<FeatureFlagsResponse>>(`${this.base}${API_ENDPOINTS.featureFlags.root}`, { params })
      .pipe(map((res) => res.data));
  }

  setEnabled(flagId: string, enabled: boolean): Observable<FeatureFlag> {
    return this.http
      .patch<ApiResponse<FeatureFlag>>(`${this.base}${API_ENDPOINTS.featureFlags.byId(flagId)}`, { enabled })
      .pipe(map((res) => res.data));
  }
}
