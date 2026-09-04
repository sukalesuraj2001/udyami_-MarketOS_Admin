import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';

export interface GeneratedContentItem {
  id: string;
  userId: string;
  calendarId: string;
  activityId: string;
  activityType: string;
  platform: string;
  contentType: string;
  productName: string | null;
  productData: { productName?: string; brand?: string; price?: number; sku?: string } | null;
  generatedContent: string;
  mediaType: string | null;
  mediaUrl: string | null;
  status: string;
  editorStatus: string | null;
  errorMessage: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  aiResponse?: {
    activity?: { date?: string; time?: string; title?: string; platform?: string; activity?: string };
    response?: GeneratedContentPayload;
    marketingContent?: GeneratedContentPayload;
  };
}

export interface GeneratedContentPayload {
  headline?: string;
  caption?: string;
  description?: string;
  callToAction?: string;
  hashtags?: string[];
  contentType?: string;
  script?: string;
  imagePrompt?: string;
  selectedProduct?: { productName?: string; brand?: string; price?: number; sku?: string } | null;
}

interface GeneratedContentResponse {
  userId: string;
  total: number;
  data: GeneratedContentItem[];
}

@Injectable({ providedIn: 'root' })
export class GeneratedContentService {
  private readonly http = inject(HttpClient);

  getByUser(userId: string): Observable<GeneratedContentItem[]> {
    return this.http
      .get<GeneratedContentResponse>(`${environment.apiBaseUrl}${API_ENDPOINTS.generatedContent.byUser(userId)}`)
      .pipe(map((response) => response.data));
  }
}