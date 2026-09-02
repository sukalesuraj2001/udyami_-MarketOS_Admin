import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';
import { Job, JobSummary } from '../../core/models/domain.model';

export interface JobsResponse {
  jobs: Job[];
  summary: JobSummary;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(): Observable<JobsResponse> {
    return this.http
      .get<ApiResponse<JobsResponse>>(`${this.base}${API_ENDPOINTS.jobs.root}`)
      .pipe(map((res) => res.data));
  }

  retry(id: string): Observable<Job> {
    return this.http
      .post<ApiResponse<Job>>(`${this.base}${API_ENDPOINTS.jobs.retry(id)}`, {})
      .pipe(map((res) => res.data));
  }

  retryAllFailed(): Observable<{ requeued: number }> {
    return this.http
      .post<ApiResponse<{ requeued: number }>>(`${this.base}${API_ENDPOINTS.jobs.retryFailed}`, {})
      .pipe(map((res) => res.data));
  }
}
