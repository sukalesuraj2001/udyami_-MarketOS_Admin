import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse, PaginatedResponse } from '../../core/api/api-response.model';
import { Incident } from '../../core/models/domain.model';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(): Observable<Incident[]> {
    return this.http
      .get<ApiResponse<PaginatedResponse<Incident>>>(`${this.base}${API_ENDPOINTS.incidents.root}`)
      .pipe(map((res) => res.data.items));
  }

  dismiss(id: string): Observable<void> {
    return this.http
      .post<ApiResponse<{ dismissed: boolean }>>(`${this.base}${API_ENDPOINTS.incidents.dismiss(id)}`, {})
      .pipe(map(() => void 0));
  }
}
