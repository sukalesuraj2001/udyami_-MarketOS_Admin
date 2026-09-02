import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemePreference = 'dark' | 'light' | 'system';
const STORAGE_KEY = 'marketos.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly media = window.matchMedia?.('(prefers-color-scheme: dark)');

  /** What the user picked: dark / light / system. */
  readonly preference = signal<ThemePreference>(this.readInitialPreference());
  /** What is actually painted: dark / light (system is resolved). */
  readonly resolvedTheme = signal<'dark' | 'light'>(this.resolve(this.preference()));

  constructor() {
    this.applyResolved(this.resolvedTheme());

    this.media?.addEventListener?.('change', () => {
      if (this.preference() === 'system') {
        this.applyResolved(this.resolve('system'));
      }
    });
  }

  setPreference(pref: ThemePreference): void {
    this.storage.set(STORAGE_KEY, pref);
    this.preference.set(pref);
    this.applyResolved(this.resolve(pref));
  }

  /** Called once from main.ts / APP_INITIALIZER before first paint to avoid a flash. */
  static applyBeforeBootstrap(): void {
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? 'dark';
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
      const resolved = stored === 'system' ? (prefersDark ? 'dark' : 'light') : stored;
      document.documentElement.setAttribute('data-theme', resolved);
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  private applyResolved(theme: 'dark' | 'light'): void {
    this.resolvedTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  private resolve(pref: ThemePreference): 'dark' | 'light' {
    if (pref === 'system') return this.media?.matches ? 'dark' : 'light';
    return pref;
  }

  private readInitialPreference(): ThemePreference {
    const stored = this.storage.get(STORAGE_KEY) as ThemePreference | null;
    return stored ?? 'dark'; // prototype ships dark-first
  }
}
