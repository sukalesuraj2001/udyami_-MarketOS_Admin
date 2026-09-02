import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse, PaginatedResponse } from '../../core/api/api-response.model';
import { AuditEntry, AuditEventKind } from '../../core/models/domain.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Audit data is append-only — this service exposes no create/update/delete method by design. */
  list(kind: AuditEventKind | 'all' = 'all'): Observable<AuditEntry[]> {
    const params = new HttpParams().set('kind', kind);
    return this.http
      .get<ApiResponse<PaginatedResponse<AuditEntry>>>(`${this.base}${API_ENDPOINTS.audit.root}`, { params })
      .pipe(map((res) => res.data.items));
  }

  exportLog(): Observable<{ downloadUrl: string; queued: boolean }> {
    return this.http
      .get<ApiResponse<{ downloadUrl: string; queued: boolean }>>(`${this.base}${API_ENDPOINTS.audit.export}`)
      .pipe(map((res) => res.data));
  }
}
