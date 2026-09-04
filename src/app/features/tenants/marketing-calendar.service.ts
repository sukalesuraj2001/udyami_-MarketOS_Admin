import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';
import { ApiResponse } from '../../core/api/api-response.model';

export interface MarketingCalendarEntry {
  day: number;
  date: string;
  time: string;
  title: string;
  activity: string;
  platform: string;
  description: string;
}

export interface MarketingCalendar {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  calendar: MarketingCalendarEntry[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MarketingCalendarService {
  private readonly http = inject(HttpClient);

  getByUser(userId: string): Observable<MarketingCalendar> {
    return this.http
      .get<ApiResponse<MarketingCalendar>>(`${environment.apiBaseUrl}${API_ENDPOINTS.marketingCalendar.byUser(userId)}`)
      .pipe(map((response) => response.data));
  }
}