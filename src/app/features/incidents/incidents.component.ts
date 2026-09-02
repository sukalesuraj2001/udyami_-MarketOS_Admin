import { Component, inject, signal } from '@angular/core';
import { IncidentsService } from './incidents.service';
import { Incident } from '../../core/models/domain.model';
import { IncidentCardComponent } from './components/incident-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-incidents-page',
  standalone: true,
  imports: [IncidentCardComponent, EmptyStateComponent, SkeletonComponent],
  templateUrl: './incidents.component.html',
})
export class IncidentsComponent {
  private readonly incidentsService = inject(IncidentsService);
  private readonly notifications = inject(NotificationService);

  readonly incidents = signal<Incident[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.incidentsService.list().subscribe({
      next: (list) => { this.incidents.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  dismiss(incident: Incident): void {
    this.incidentsService.dismiss(incident.id).subscribe(() => {
      this.incidents.update((list) => list.filter((i) => i.id !== incident.id));
      this.notifications.info('Dismissed', 'Recorded in the audit log');
    });
  }
}
