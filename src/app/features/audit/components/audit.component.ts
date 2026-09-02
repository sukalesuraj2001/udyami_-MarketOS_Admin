import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../audit.service';
import { AuditEntry, AuditEventKind } from '../../../core/models/domain.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [FormsModule, EmptyStateComponent, SkeletonComponent],
  templateUrl: './audit.component.html',
})
export class AuditComponent {
  private readonly auditService = inject(AuditService);
  private readonly notifications = inject(NotificationService);

  readonly entries = signal<AuditEntry[]>([]);
  readonly loading = signal(true);
  readonly exporting = signal(false);
  filter: AuditEventKind | 'all' = 'all';

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.auditService.list(this.filter).subscribe({
      next: (entries) => { this.entries.set(entries); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportLog(): void {
    this.exporting.set(true);
    this.auditService.exportLog().subscribe({
      next: () => { this.notifications.info('Export queued', 'Signed CSV, ready in a moment'); this.exporting.set(false); },
      error: () => this.exporting.set(false),
    });
  }
}
