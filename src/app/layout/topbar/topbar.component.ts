import { Component, computed, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemePreference } from '../../core/services/theme.service';
import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);
  readonly authStore = inject(AuthStore);
  readonly theme = inject(ThemeService);

  readonly menuToggled = output<void>();
  searchTerm = '';

  readonly userInitials = computed(() => {
    const name = this.authStore.user()?.name?.trim() ?? '';
    if (!name) return '';
    const parts = name.split(/\s+/);
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  });

  readonly themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'Auto' },
  ];

  setTheme(pref: ThemePreference): void {
    this.theme.setPreference(pref);
  }

  logout(): void {
    this.authService.logout();
  }
}
