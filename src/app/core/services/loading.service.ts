import { Injectable, computed, signal } from '@angular/core';

/**
 * Reference-counted loading state. Any number of concurrent requests can
 * call start()/stop() without one finishing early and hiding the spinner
 * while another is still in flight.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _count = signal(0);
  readonly isLoading = computed(() => this._count() > 0);

  start(): void {
    this._count.update((n) => n + 1);
  }

  stop(): void {
    this._count.update((n) => Math.max(0, n - 1));
  }
}
