import { Component, input, output } from '@angular/core';
import { Incident } from '../../../core/models/domain.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { NotificationService } from '../../../core/services/notification.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-incident-card',
  standalone: true,
  imports: [StatusTagComponent],
  templateUrl: './incident-card.component.html',
})
export class IncidentCardComponent {
  private readonly notifications = inject(NotificationService);

  readonly incident = input.required<Incident>();
  readonly dismissed = output<void>();

  borderColor(): string {
    const k = this.incident().severity;
    if (k === 'action_needed') return 'rgba(229,100,78,.3)';
    if (k === 'watch') return 'rgba(224,160,48,.3)';
    return 'var(--color-border)';
  }

  onAction(): void {
    // These map to real backend workflows (open a CSM task, ping the tenant's
    // contact channel, re-poll a partner API status) — left as a clear
    // integration point pending those endpoints' specs.
    this.notifications.info(this.incident().actionLabel, 'Action queued for this incident.');
  }
}
