import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="card kpi">
      <div class="kpi-label">{{ label() }}</div>
      <div class="kpi-value" [style.color]="valueColor()">{{ value() }}</div>
      <div class="kpi-sub">{{ sub() }}</div>
    </div>
  `,
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly sub = input<string>('');
  readonly valueColor = input<string>('');
}
