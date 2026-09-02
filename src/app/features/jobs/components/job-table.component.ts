import { Component, input, output } from '@angular/core';
import { Job } from '../../../core/models/domain.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-job-table',
  standalone: true,
  imports: [StatusTagComponent, EmptyStateComponent],
  templateUrl: './job-table.component.html',
})
export class JobTableComponent {
  readonly jobs = input.required<Job[]>();
  readonly retry = output<Job>();
}
