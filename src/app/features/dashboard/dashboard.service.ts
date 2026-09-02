import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';
import { DashboardSummary } from '../../core/models/domain.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${environment.apiBaseUrl}${API_ENDPOINTS.dashboard.root}`)
  }

  haltPlatform(): Observable<{ halted: boolean; tenantsAffected: number }> {
    return this.http
      .post<ApiResponse<{ halted: boolean; tenantsAffected: number }>>(`${environment.apiBaseUrl}${API_ENDPOINTS.platform.halt}`, {})
      .pipe(map((res) => res.data));
  }
}
