import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthUser } from './models/user.model';
import { LoginResponse } from './models/auth-response.model';
import { StorageService } from '../services/storage.service';

const SESSION_KEY = 'marketos.auth.session';

/**
 * Holds authentication state as signals. This is UI/session state, not a
 * source of authorization truth — every privileged API call is still
 * re-checked by the backend (see section 41 of the architecture brief).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly storage = inject(StorageService);

  private readonly _session = signal<LoginResponse | null>(this.readSession());

  readonly user = computed<AuthUser | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly accessToken = computed(() => this._session()?.accessToken ?? null);

  /** Persists the /auth/loginUser response exactly as received. */
  setSession(session: LoginResponse): void {
    this._session.set(session);
    this.storage.set(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    this._session.set(null);
    this.storage.remove(SESSION_KEY);
  }

  private readSession(): LoginResponse | null {
    const raw = this.storage.get(SESSION_KEY);
    return raw ? (JSON.parse(raw) as LoginResponse) : null;
  }
}
