import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { Incident } from '../../core/models/domain.model';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(): Observable<Incident[]> {
    return this.http
      .get<Incident[]>(`${this.base}${API_ENDPOINTS.incidents.root}`);
  }

  resolve(incident: Incident): Observable<Incident> {
    return this.http
      .patch<Incident>(
        `${this.base}${API_ENDPOINTS.incidents.updateStatus(incident.id)}`,
        { userId: incident.userId, status: 'RESOLVED' },
      )
      .pipe(map((res) => res));
  }
}
