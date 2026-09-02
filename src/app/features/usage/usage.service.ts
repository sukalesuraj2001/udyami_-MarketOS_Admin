import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';
import { UsageSummary } from '../../core/models/domain.model';

@Injectable({ providedIn: 'root' })
export class UsageService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get(): Observable<UsageSummary> {
    return this.http
      .get<ApiResponse<UsageSummary>>(`${this.base}${API_ENDPOINTS.usage.root}`)
      .pipe(map((res) => res.data));
  }

  exportUsage(): Observable<{ downloadUrl: string; queued: boolean }> {
    return this.http
      .get<ApiResponse<{ downloadUrl: string; queued: boolean }>>(`${this.base}${API_ENDPOINTS.usage.export}`)
      .pipe(map((res) => res.data));
  }
}
