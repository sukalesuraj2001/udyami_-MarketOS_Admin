import { Component, computed, input } from '@angular/core';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 90;
const PAD_LEFT = 30;
const PAD_TOP = 10;
const PAD_BOTTOM = 20;
const VIEW_WIDTH = PAD_LEFT + CHART_WIDTH + 10;
const VIEW_HEIGHT = PAD_TOP + CHART_HEIGHT + PAD_BOTTOM;

@Component({
  selector: 'app-margin-by-tenant',
  standalone: true,
  template: `
    <div class="card">
      <h3 style="font-size:15px;margin-bottom:4px">New sign-ups this month</h3>
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:10px">
        <span style="color:var(--color-text-dim)">Digital users registered per day</span>
        <span class="mono" style="color:var(--color-text-dim)">{{ totalSignups() }} total</span>
      </div>
      @if (dailySignups().length) {
        <svg [attr.viewBox]="viewBox" style="width:100%;height:140px;display:block">
          <line [attr.x1]="padLeft" [attr.y1]="padTop" [attr.x2]="padLeft" [attr.y2]="padTop + chartHeight" stroke="var(--color-border-strong)" stroke-width="1" />
          <line [attr.x1]="padLeft" [attr.y1]="padTop + chartHeight" [attr.x2]="padLeft + chartWidth" [attr.y2]="padTop + chartHeight" stroke="var(--color-border-strong)" stroke-width="1" />

          @for (tick of yTicks(); track tick.value) {
            <text [attr.x]="padLeft - 6" [attr.y]="tick.y + 3" text-anchor="end" font-size="8" fill="var(--color-text-dim)">{{ tick.value }}</text>
          }

          @for (tick of xTicks(); track tick.day) {
            <text [attr.x]="tick.x" [attr.y]="padTop + chartHeight + 12" text-anchor="middle" font-size="8" fill="var(--color-text-dim)">{{ tick.day }}</text>
          }

          <polyline [attr.points]="sparklinePoints()" fill="none" stroke="var(--color-primary)" stroke-width="2" vector-effect="non-scaling-stroke" />
        </svg>
      } @else {
        <div class="empty-state" style="font-size:12px">No sign-up data yet this month.</div>
      }
    </div>
  `,
})
export class MarginByTenantComponent {
  readonly dailySignups = input<number[]>([]);

  readonly padLeft = PAD_LEFT;
  readonly padTop = PAD_TOP;
  readonly chartWidth = CHART_WIDTH;
  readonly chartHeight = CHART_HEIGHT;
  readonly viewBox = `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`;

  readonly totalSignups = computed(() => this.dailySignups().reduce((sum, count) => sum + count, 0));

  private readonly maxValue = computed(() => Math.max(...this.dailySignups(), 1));

  readonly sparklinePoints = computed(() => {
    const data = this.dailySignups();
    if (!data.length) return '';
    const max = this.maxValue();
    const step = data.length > 1 ? this.chartWidth / (data.length - 1) : 0;
    return data
      .map((value, i) => {
        const x = this.padLeft + i * step;
        const y = this.padTop + this.chartHeight - (value / max) * this.chartHeight;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });

  readonly yTicks = computed(() => {
    const max = this.maxValue();
    const mid = Math.round(max / 2);
    return [
      { value: max, y: this.padTop },
      { value: mid, y: this.padTop + this.chartHeight / 2 },
      { value: 0, y: this.padTop + this.chartHeight },
    ];
  });

  readonly xTicks = computed(() => {
    const data = this.dailySignups();
    if (!data.length) return [];
    const step = data.length > 1 ? this.chartWidth / (data.length - 1) : 0;
    const tickEvery = Math.ceil(data.length / 6);
    const ticks: { day: number; x: number }[] = [];
    for (let i = 0; i < data.length; i += tickEvery) {
      ticks.push({ day: i + 1, x: this.padLeft + i * step });
    }
    const lastDay = data.length;
    if (ticks[ticks.length - 1]?.day !== lastDay) {
      ticks.push({ day: lastDay, x: this.padLeft + (data.length - 1) * step });
    }
    return ticks;
  });
}
