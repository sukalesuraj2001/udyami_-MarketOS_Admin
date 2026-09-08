import { Injectable, computed, inject, signal } from '@angular/core';
import { EditorTask, EditorTaskStatus } from '../../core/models/domain.model';
import { mockDb } from '../../core/mock/mock-db';
import { Editor } from '../../core/services/editor';

/**
 * Client-side store for the Editor role's content-calendar tasks. Fully
 * in-memory/mocked, consistent with how the rest of this prototype avoids
 * real API round-trips for not-yet-backed features — actions here mutate
 * local state directly rather than calling HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class EditorTaskStore {
  private readonly editorService = inject(Editor);
  private readonly _tasks = signal<EditorTask[]>(mockDb.editorTasks);
  readonly tasks = this._tasks.asReadonly();

  readonly pendingCount = signal(0);
  readonly inProgressCount = signal(0);
  readonly myQueueCount = computed(() => this.pendingCount() + this.inProgressCount());

  constructor() {
    this.loadCounts();
  }

  startEditing(id: string): void {
    this.setStatus(id, 'in_progress');
  }

  markDone(id: string): void {
    this.setStatus(id, 'done', { completedAt: new Date().toISOString() });
  }

  publish(id: string): void {
    this.setStatus(id, 'done');
  }

  backToInProgress(id: string): void {
    this.setStatus(id, 'in_progress');
  }

  private loadCounts(): void {
    this.editorService.getAllContent().subscribe({
      next: (response) => {
        this.pendingCount.set(response?.pendingCount ?? 0);
        this.inProgressCount.set(response?.inProgressCount ?? 0);
      },
      error: () => {
        this.pendingCount.set(0);
        this.inProgressCount.set(0);
      },
    });
  }

  updateNotes(id: string, notes: string): void {
    this.updateTask(id, { notes });
  }

  private setStatus(id: string, status: EditorTaskStatus, extra: Partial<EditorTask> = {}): void {
    this.updateTask(id, { status, ...extra });
  }

  private updateTask(id: string, patch: Partial<EditorTask>): void {
    this._tasks.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
}
