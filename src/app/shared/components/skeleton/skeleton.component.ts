import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div class="skeleton" [style.height.px]="height()" [style.width]="width()"></div>`,
})
export class SkeletonComponent {
  readonly height = input<number>(16);
  readonly width = input<string>('100%');
}
