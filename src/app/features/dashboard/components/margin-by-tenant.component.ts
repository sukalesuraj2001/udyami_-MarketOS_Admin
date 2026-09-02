import { Component, input } from '@angular/core';
import { MarginEntry } from '../../../core/models/domain.model';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-margin-by-tenant',
  standalone: true,
  imports: [ProgressBarComponent],
  template: `
    <div class="card">
      <h3 style="font-size:15px;margin-bottom:14px">Margin by tenant</h3>
      @for (m of entries(); track m.tenantName) {
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px">
            <b>{{ m.tenantName }}</b>
            <span class="mono" [style.color]="m.marginPct > 60 ? 'var(--color-success)' : 'var(--color-danger)'">{{ m.marginPct }}%</span>
          </div>
          <app-progress-bar [percent]="m.marginPct" [color]="m.marginPct > 60 ? 'var(--color-success)' : 'var(--color-danger)'" />
        </div>
      }
    </div>
  `,
})
export class MarginByTenantComponent {
  readonly entries = input.required<MarginEntry[]>();
}
