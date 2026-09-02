import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  template: `
    <div class="toast-stack" role="status" aria-live="polite">
      @for (t of notifications.toasts(); track t.id) {
        <div class="toast" [class.toast-ok]="t.kind === 'ok'" [class.toast-danger]="t.kind === 'danger'">
          <b>{{ t.title }}</b>
          @if (t.detail) { <span>{{ t.detail }}</span> }
        </div>
      }
    </div>
  `,
})
export class ToastStackComponent {
  readonly notifications = inject(NotificationService);
}
