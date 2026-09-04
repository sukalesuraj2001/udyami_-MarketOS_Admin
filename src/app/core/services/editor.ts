import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../api/api-response.model';
import { API_ENDPOINTS } from '../api/api.constants';

@Injectable({
  providedIn: 'root',
})
export class Editor {
  private readonly http = inject(HttpClient);

  // Get all content for editor dashboard
  getAllContent(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(
        `${environment.apiBaseUrl}${API_ENDPOINTS.editor.getAllContent}`
      )
      .pipe(map((res) => res?.data ?? res));
  }

  // Update editor ID and editor status
  updateContentStatus(
    contentId: string,
    data: {
      editorId: string;
      editorStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    }
  ): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(
        `${environment.apiBaseUrl}${API_ENDPOINTS.editor.updateContentStatus(contentId)}`,
        data
      )
      .pipe(map((res) => res.data));
  }

  // Get content assigned to specific editor
 getMyEditedContent(editorId: string): Observable<any> {
  return this.http.get(
    `${environment.apiBaseUrl}${API_ENDPOINTS.editor.getMyEditedContent(editorId)}`
  );
}
}