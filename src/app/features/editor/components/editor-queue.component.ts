import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';


import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EditorTaskModalComponent } from './editor-task-modal.component';
import { Editor } from '../../../core/services/editor';

type StatusFilter =
  | 'pending'
  | 'in_progress'
  | 'done'
  | 'published'
  | 'active'
  | 'all';

@Component({
  selector: 'app-editor-queue-page',
  standalone: true,
  imports: [
    FormsModule,
    KpiCardComponent,
    StatusTagComponent,
    EmptyStateComponent,
    EditorTaskModalComponent,
  ],
  templateUrl: './editor-queue.component.html',
})
export class EditorQueueComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly editorService = inject(Editor);

  readonly pageTitle: string =
    this.route.snapshot.data['pageTitle'] ?? 'My Queue';

  readonly pageSubtitle: string =
    this.route.snapshot.data['pageSubtitle'] ?? '';

  readonly tenantFilter = signal<string>('all');
  readonly typeFilter = signal<string>('all');

  readonly statusFilter = signal<StatusFilter>(
    (this.route.snapshot.data['statusFilter'] as StatusFilter) ?? 'all'
  );

  // ==============================
  // API DATA
  // ==============================

  readonly contents = signal<any[]>([]);

  readonly pendingCount = signal(0);
  readonly inProgressCount = signal(0);
  readonly doneCount = signal(0);
  readonly totalCount = signal(0);

  readonly openTaskId = signal<string | null>(null);

  // ==============================
  // TENANTS
  // ==============================

  readonly tenants = computed(() => {
    return Array.from(
      new Set(
        this.contents()
          .map(
            (content) =>
              content.businessData?.businessName
          )
          .filter(Boolean)
      )
    ).sort();
  });

  // ==============================
  // FILTERED CONTENT
  // ==============================

  readonly filteredTasks = computed(() => {
    const tenant = this.tenantFilter();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.contents().filter((content) => {
      const contentTenant =
        content.businessData?.businessName || '';

      const contentType = String(
        content.contentType ||
        content.activityType ||
        ''
      ).toLowerCase();

      const contentStatus = String(
        content.editorStatus || ''
      ).toLowerCase();

      // Tenant filter
      if (
        tenant !== 'all' &&
        contentTenant !== tenant
      ) {
        return false;
      }

      // Type filter
      if (
        type !== 'all' &&
        contentType !== type
      ) {
        return false;
      }

      // Status filter
      if (status === 'active') {
        return (
          contentStatus === 'pending' ||
          contentStatus === 'in_progress'
        );
      }

      if (
        status !== 'all' &&
        contentStatus !== status
      ) {
        return false;
      }

      return true;
    });
  });

  constructor() {
    this.getEditorContent();
  }

  // ==============================
  // GET ALL EDITOR CONTENT
  // ==============================

  getEditorContent(): void {
    this.editorService.getAllContent().subscribe({
      next: (response) => {
        this.contents.set(response?.contents ?? []);

        this.pendingCount.set(
          response?.pendingCount ?? 0
        );

        this.inProgressCount.set(
          response?.inProgressCount ?? 0
        );

        this.doneCount.set(
          response?.doneCount ?? 0
        );

        this.totalCount.set(
          response?.totalCount ?? 0
        );
      },

      error: (error) => {
        console.error(
          'Failed to load editor content:',
          error
        );

        this.contents.set([]);
        this.pendingCount.set(0);
        this.inProgressCount.set(0);
        this.doneCount.set(0);
        this.totalCount.set(0);
      },
    });
  }

  // ==============================
  // OPEN CONTENT
  // ==============================

  openTaskModal(id: string): void {
    this.openTaskId.set(id);
  }

  closeTaskModal(): void {
    this.openTaskId.set(null);
  }


  getGeneratedData(generatedContent: string | null): any {
    if (!generatedContent) {
      return null;
    }

    try {
      return JSON.parse(generatedContent);
    } catch {
      return null;
    }
  }

  getContentById(id: string): any {
    return this.contents().find((content) => content.id === id) ?? null;
  }
}