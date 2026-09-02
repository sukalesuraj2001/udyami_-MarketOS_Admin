import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="bar" [style.width.px]="width()">
      <i [style.width.%]="clampedPercent()" [style.background]="color()"></i>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly percent = input.required<number>();
  readonly color = input<string>('var(--color-primary)');
  /** optional fixed pixel width; omit to stretch full container width */
  readonly width = input<number | null>(null);

  clampedPercent(): number {
    return Math.max(0, Math.min(100, this.percent()));
  }
}
