import { Injectable, computed, signal } from '@angular/core';
import { EditorTask, EditorTaskStatus } from '../../core/models/domain.model';
import { mockDb } from '../../core/mock/mock-db';

/**
 * Client-side store for the Editor role's content-calendar tasks. Fully
 * in-memory/mocked, consistent with how the rest of this prototype avoids
 * real API round-trips for not-yet-backed features — actions here mutate
 * local state directly rather than calling HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class EditorTaskStore {
  private readonly _tasks = signal<EditorTask[]>(mockDb.editorTasks);
  readonly tasks = this._tasks.asReadonly();

  readonly pendingCount = computed(() => this._tasks().filter((t) => t.status === 'pending').length);
  readonly inProgressCount = computed(() => this._tasks().filter((t) => t.status === 'in_progress').length);
  readonly myQueueCount = computed(() => this.pendingCount() + this.inProgressCount());

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
