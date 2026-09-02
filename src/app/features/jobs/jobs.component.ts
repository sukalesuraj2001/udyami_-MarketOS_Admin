import { Component, inject, signal } from '@angular/core';
import { JobsService } from './jobs.service';
import { Job, JobSummary } from '../../core/models/domain.model';
import { JobTableComponent } from './components/job-table.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [JobTableComponent, KpiCardComponent, SkeletonComponent, ConfirmDialogComponent],
  templateUrl: './jobs.component.html',
})
export class JobsComponent {
  private readonly jobsService = inject(JobsService);
  private readonly notifications = inject(NotificationService);

  readonly jobs = signal<Job[]>([]);
  readonly summary = signal<JobSummary | null>(null);
  readonly loading = signal(true);
  readonly confirmRetryAllOpen = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.jobsService.list().subscribe({
      next: (res) => { this.jobs.set(res.jobs); this.summary.set(res.summary); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  retry(job: Job): void {
    this.jobsService.retry(job.id).subscribe(() => {
      this.notifications.success('Requeued', `${job.id} — idempotency key reused, no double publish`);
      this.load();
    });
  }

  retryAllFailed(): void {
    this.confirmRetryAllOpen.set(false);
    this.jobsService.retryAllFailed().subscribe((res) => {
      if (res.requeued === 0) {
        this.notifications.info('Nothing to retry', 'No failed jobs in the window');
      } else {
        this.notifications.success(`Requeued ${res.requeued} jobs`, 'All reuse their original idempotency keys');
      }
      this.load();
    });
  }
}
