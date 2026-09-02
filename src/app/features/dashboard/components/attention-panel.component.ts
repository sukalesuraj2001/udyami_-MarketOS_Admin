import { Component, input, output } from '@angular/core';
import { DashboardSummary } from '../../../core/models/domain.model';

@Component({
  selector: 'app-attention-panel',
  standalone: true,
  template: `
    <div class="card">
      <h3 style="font-size:15px;margin-bottom:14px">Needs attention</h3>
      @for (alert of summary().attentionAlerts; track alert.title) {
        <div class="alert" [class]="'alert-' + (alert.level === 'danger' ? 'danger' : alert.level === 'warn' ? 'warn' : 'info')">
          <span>{{ alert.level === 'info' ? '◆' : '▲' }}</span>
          <span><b>{{ alert.title }}</b><span class="alert-sub">{{ alert.detail }}</span></span>
        </div>
      }
      <button class="btn btn-sm" type="button" (click)="openIncidents.emit()">Open incidents</button>
    </div>
  `,
})
export class AttentionPanelComponent {
  readonly summary = input.required<DashboardSummary>();
  readonly openIncidents = output<void>();
}
