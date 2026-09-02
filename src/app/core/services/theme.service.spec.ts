import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { StorageService } from './storage.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(StorageService);
    service = TestBed.inject(ThemeService);
  });

  it('defaults to dark when nothing is stored', () => {
    expect(service.preference()).toBe('dark');
  });

  it('persists an explicit preference and resolves it immediately', () => {
    service.setPreference('light');
    expect(service.preference()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
    expect(storage.get('marketos.theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('reads a previously stored preference on next construction', () => {
    storage.set('marketos.theme', 'light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(ThemeService);
    expect(fresh.preference()).toBe('light');
  });
});
