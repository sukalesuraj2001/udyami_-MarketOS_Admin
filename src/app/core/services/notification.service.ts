import { Injectable, signal } from '@angular/core';

export type ToastKind = 'ok' | 'danger' | 'warn' | 'info';

export interface ToastMessage {
  id: number;
  title: string;
  detail?: string;
  kind: ToastKind;
}

let nextId = 1;

/**
 * Renders as accessible toasts via ToastComponent (aria-live region).
 * No component ever touches the DOM directly to show a notification —
 * everything routes through this signal-backed queue.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(title: string, detail?: string): void {
    this.push(title, detail, 'ok');
  }

  error(title: string, detail?: string): void {
    this.push(title, detail, 'danger');
  }

  warning(title: string, detail?: string): void {
    this.push(title, detail, 'warn');
  }

  info(title: string, detail?: string): void {
    this.push(title, detail, 'info');
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(title: string, detail: string | undefined, kind: ToastKind): void {
    const toast: ToastMessage = { id: nextId++, title, detail, kind };
    this._toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 4200);
  }
}
