import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `<div class="empty-state">{{ message() }}</div>`,
})
export class EmptyStateComponent {
  readonly message = input<string>('Nothing to show.');
}
