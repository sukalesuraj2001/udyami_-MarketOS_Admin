import { Component, inject, signal } from '@angular/core';
import { UsageService } from '../usage.service';
import { UsageSummary, CreditBalance } from '../../../core/models/domain.model';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usage-page',
  standalone: true,
  imports: [KpiCardComponent, ProgressBarComponent, SkeletonComponent],
  templateUrl: './usage.component.html',
})
export class UsageComponent {
  private readonly usageService = inject(UsageService);
  private readonly notifications = inject(NotificationService);

  readonly summary = signal<UsageSummary | null>(null);
  readonly loading = signal(true);
  readonly exporting = signal(false);

  constructor() {
    this.usageService.get().subscribe({
      next: (s) => { this.summary.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  creditColor(c: CreditBalance): string {
    if (c.percentageUsed > 75) return 'var(--color-danger)';
    if (c.percentageUsed > 50) return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  topUp(tenantName: string): void {
    // Real implementation would POST to a credits endpoint; wired for the
    // interaction pattern pending that contract.
    this.notifications.success('Credits granted', `${tenantName} — ₹25,000 added`);
  }

  exportUsage(): void {
    this.exporting.set(true);
    this.usageService.exportUsage().subscribe({
      next: () => { this.notifications.info('Export queued', 'August usage CSV will download shortly'); this.exporting.set(false); },
      error: () => this.exporting.set(false),
    });
  }
}
