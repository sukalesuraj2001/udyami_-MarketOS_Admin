import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardSummary, DigitalUser, DigitalUserSummary } from '../../core/models/domain.model';
import { computeDashboardSummary } from '../../core/mock/mock-db';
import { DashboardKpiGridComponent } from './components/kpi-grid.component';
import { AttentionPanelComponent } from './components/attention-panel.component';
import { MarginByTenantComponent } from './components/margin-by-tenant.component';
import { PlatformHaltDialogComponent } from './components/platform-halt-dialog.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DashboardKpiGridComponent, AttentionPanelComponent, MarginByTenantComponent, PlatformHaltDialogComponent, SkeletonComponent, KpiCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  // TODO: everything below except digitalUserCount/digitalUsers is still
  // dummy data from mock-db.ts — swap for the real endpoints as they land.
  readonly summary = signal<DashboardSummary>(computeDashboardSummary());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly haltDialogOpen = signal(false);

  readonly digitalUserCount = signal<number>(0);

  readonly digitalUsers = signal<DigitalUser[]>([]);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getSummary().subscribe({
      next: (response: DigitalUserSummary) => {
        console.log('The response is:', response);

        this.digitalUserCount.set(response.count);
        this.digitalUsers.set(response.users);

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.error.set('Failed to load digital users');
      },
    });
  }

  goToIncidents(): void {
    this.router.navigateByUrl('/admin/incidents');
  }

  onHalted(): void {
    this.haltDialogOpen.set(false);
    this.load();
  }
}
