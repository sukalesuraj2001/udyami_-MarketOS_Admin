import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/api/api.constants';

export interface AccountCredential {
  id: string;
  userId: string;
  platform: string;
  username: string;
  accountId: string | null;
  accessToken: string | null;
  password: string | null;
  tokenExpiresAt: string | null;
  connected: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountCredentialUpdate {
  accountId: string;
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AccountCredentialsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(): Observable<AccountCredential[]> {
    return this.http.get<AccountCredential[] | { data?: AccountCredential[] }>(
      `${this.base}${API_ENDPOINTS.settings.allAccounts}`,
    ).pipe(map((response) => Array.isArray(response) ? response : response.data ?? []));
  }

  update(id: string, request: AccountCredentialUpdate): Observable<AccountCredential> {
    return this.http.patch<AccountCredential | { data?: AccountCredential }>(
      `${this.base}${API_ENDPOINTS.settings.updateAccount(id)}`,
      request,
    ).pipe(map((response) => 'data' in response && response.data ? response.data : response as AccountCredential));
  }
}