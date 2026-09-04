import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';

import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

import {
  editorTaskTypeLabel,
  editorTaskStatusLabel,
  editorTaskStatusVariant
} from '../editor-task.util';

import { Editor } from '../../../core/services/editor';

@Component({
  selector: 'app-editor-history-page',
  standalone: true,

  imports: [
    FormsModule,
    SlicePipe,
    StatusTagComponent,
    EmptyStateComponent
  ],

  templateUrl: './editor-history.component.html',
})
export class EditorHistoryComponent implements OnInit {

  private readonly editorService = inject(Editor);

  readonly editorTaskTypeLabel = editorTaskTypeLabel;
  readonly editorTaskStatusLabel = editorTaskStatusLabel;
  readonly editorTaskStatusVariant = editorTaskStatusVariant;

  readonly searchTerm = signal('');
  readonly isLoading = signal(false);

  readonly tasks = signal<any[]>([]);

  // Selected task for view modal
  readonly selectedTask = signal<any | null>(null);

  readonly totalCount = signal(0);
  readonly pendingCount = signal(0);
  readonly inProgressCount = signal(0);
  readonly doneCount = signal(0);

  readonly completedTasks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    return this.tasks()
      .filter((task) => {
        return (
          String(task.editorStatus ?? '')
            .trim()
            .toUpperCase() === 'DONE'
        );
      })
      .filter((task) => {
        if (!term) {
          return true;
        }

        const businessName = String(
          task.businessData?.businessName ?? ''
        ).toLowerCase();

        const activity = String(
          task.activityType ?? ''
        ).toLowerCase();

        const platform = String(
          task.platform ?? ''
        ).toLowerCase();

        const contentType = String(
          task.contentType ?? ''
        ).toLowerCase();

        const productName = String(
          task.productName ??
          task.productData?.productName ??
          ''
        ).toLowerCase();

        const activityTitle = String(
          task.aiResponse?.activity?.title ?? ''
        ).toLowerCase();

        return (
          businessName.includes(term) ||
          activity.includes(term) ||
          platform.includes(term) ||
          contentType.includes(term) ||
          productName.includes(term) ||
          activityTitle.includes(term)
        );
      })
      .sort((a, b) => {
        const dateA =
          a.updatedAt ??
          a.completedAt ??
          a.createdAt ??
          '';

        const dateB =
          b.updatedAt ??
          b.completedAt ??
          b.createdAt ??
          '';

        return String(dateB).localeCompare(String(dateA));
      });
  });

  ngOnInit(): void {
    const editorId = this.getEditorId();

    if (!editorId) {
      console.error('Editor ID not found');
      return;
    }

    console.log('Editor ID:', editorId);

    this.getMyEditedContent(editorId);
  }

  private getEditorId(): string | null {
    const authData = localStorage.getItem('marketos.auth.session');

    if (!authData) {
      console.error('Auth session not found in localStorage');
      return null;
    }

    try {
      const parsedData = JSON.parse(authData);
      return parsedData?.user?.userId ?? null;
    } catch (error) {
      console.error(
        'Failed to parse auth session from localStorage:',
        error
      );

      return null;
    }
  }

  getMyEditedContent(editorId: string): void {
    this.isLoading.set(true);

    this.editorService
      .getMyEditedContent(editorId)
      .subscribe({
        next: (response) => {
          console.log('My Edited Content:', response);

          this.totalCount.set(response?.totalCount ?? 0);
          this.pendingCount.set(response?.pendingCount ?? 0);
          this.inProgressCount.set(response?.inProgressCount ?? 0);
          this.doneCount.set(response?.doneCount ?? 0);

          const contents =
            Array.isArray(response?.contents)
              ? response.contents
              : [];

          console.log('All Contents:', contents);

          this.tasks.set(contents);
          this.isLoading.set(false);
        },

        error: (error) => {
          console.error(
            'Failed to get edited content:',
            error
          );

          this.tasks.set([]);
          this.totalCount.set(0);
          this.pendingCount.set(0);
          this.inProgressCount.set(0);
          this.doneCount.set(0);
          this.isLoading.set(false);
        }
      });
  }

  // Open modal with selected task
  openTaskModal(task: any): void {
    console.log('Selected Task:', task);
    console.log('Media URL:', task.mediaUrl);

    this.selectedTask.set(task);
  }

  // Close modal
  closeTaskModal(): void {
    this.selectedTask.set(null);
  }
}