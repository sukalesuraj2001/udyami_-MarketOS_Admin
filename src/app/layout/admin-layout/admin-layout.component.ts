import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavGroup } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastStackComponent } from '../../shared/components/toast/toast.component';
import { AuthStore } from '../../core/auth/auth.store';
import { AppRole } from '../../core/auth/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastStackComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private readonly authStore = inject(AuthStore);
  readonly mobileNavOpen = signal(false);

  readonly navGroups = computed<NavGroup[]>(() => {
    const isSuperAdmin = this.authStore.user()?.roles?.includes(AppRole.SuperAdmin) ?? false;
    return [
      {
        label: 'Platform',
        items: [
          { path: '/admin/overview', icon: '◧', label: 'Overview' },
          { path: '/admin/tenants', icon: '▦', label: 'Tenants' },
          { path: '/admin/incidents', icon: '▲', label: 'Incidents' },
        ],
      },
      {
        label: 'Operations',
        items: [
          // { path: '/admin/jobs', icon: '≡', label: 'Job queue' },
          { path: '/admin/quota', icon: '◫', label: 'API quota' },
        ],
      },
      {
        label: 'Commercial',
        items: [{ path: '/admin/usage', icon: '₹', label: 'Usage & margin' }],
      },
      ...(isSuperAdmin
        ? [
            {
              label: 'Control',
              items: [
                { path: '/admin/feature-flags', icon: '⚑', label: 'Feature flags' },
                { path: '/admin/audit', icon: '◉', label: 'Audit log' },
              ],
            },
          ]
        : []),
    ];
  });

  toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
