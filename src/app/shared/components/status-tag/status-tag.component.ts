import { Component, input } from '@angular/core';

export type StatusTagVariant = 'ok' | 'warn' | 'danger' | 'info' | 'violet' | 'neutral';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  template: `<span class="tag" [class]="'tag-' + variant()">{{ label() }}</span>`,
})
export class StatusTagComponent {
  readonly label = input.required<string>();
  readonly variant = input<StatusTagVariant>('neutral');
}
