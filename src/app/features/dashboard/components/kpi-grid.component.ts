import { Component, input } from '@angular/core';
import { DashboardSummary } from '../../../core/models/domain.model';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-dashboard-kpi-grid',
  standalone: true,
  imports: [KpiCardComponent],
  template: `
    <div class="grid grid-4" style="margin-bottom:16px">
      <app-kpi-card label="MRR" [value]="summary().mrrLabel" [sub]="summary().mrrDeltaLabel" />
      <app-kpi-card label="Gross margin" [value]="summary().grossMarginPct + '%'" sub="target 60–70%" />
      <app-kpi-card label="AI spend MTD" [value]="summary().aiSpendMtdLabel" [sub]="summary().aiSpendNote" />
      <app-kpi-card label="Publish success" [value]="summary().publishSuccessPct + '%'"
        valueColor="var(--color-success)" [sub]="summary().publishSuccessNote" />
    </div>
  `,
})
export class DashboardKpiGridComponent {
  readonly summary = input.required<DashboardSummary>();
}
