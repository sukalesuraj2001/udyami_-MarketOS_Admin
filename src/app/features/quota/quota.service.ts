import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';
import { QuotaSummary } from '../../core/models/domain.model';

@Injectable({ providedIn: 'root' })
export class QuotaService {
  private readonly http = inject(HttpClient);

  get(): Observable<QuotaSummary> {
    return this.http
      .get<ApiResponse<QuotaSummary>>(`${environment.apiBaseUrl}${API_ENDPOINTS.quota.root}`)
      .pipe(map((res) => res.data));
  }

  getAnthropicUsage(): Observable<any> {
    return this.http.get<any>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.quota.getAnthropicUsage}`,
    );
  }

  getAllUsersAiTokenUsage(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}${API_ENDPOINTS.quota.getAllUsersAiTokenUsage}`,
    );
  }
}
