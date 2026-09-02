import { Component, inject, signal } from '@angular/core';
import { QuotaService } from '../quota.service';
import { QuotaSummary } from '../../../core/models/domain.model';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-quota-page',
  standalone: true,
  imports: [KpiCardComponent, ProgressBarComponent, SkeletonComponent],
  templateUrl: './quota.component.html',
})
export class QuotaComponent {
  private readonly quotaService = inject(QuotaService);
  readonly summary = signal<QuotaSummary | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.quotaService.get().subscribe({
      next: (s) => { this.summary.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
