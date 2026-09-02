import { Injectable } from '@angular/core';

/**
 * Thin wrapper around localStorage so the rest of the app never touches
 * `window.localStorage` directly — makes it trivial to swap storage
 * strategy (e.g. in-memory + httpOnly refresh cookie) later.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable (private mode, SSR, etc.) — fail silently */
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }
}
