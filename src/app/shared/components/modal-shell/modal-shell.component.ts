import { Component, HostListener, input, output } from '@angular/core';

/**
 * Generic dialog chrome (overlay + panel + header/body/footer slots).
 * Feature dialogs (ProvisionTenant, Impersonate, Suspend, Halt...) project
 * their own form/content into it rather than re-implementing overlay
 * mechanics each time.
 */
@Component({
  selector: 'app-modal-shell',
  standalone: true,
  template: `
    <div class="modal-overlay" role="button" tabindex="0" aria-label="Close dialog" (click)="onBackdropClick($event)" (keydown.enter)="closed.emit()">
      <div class="modal-panel" role="dialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title() }}</h3>
          <button type="button" class="modal-close" (click)="closed.emit()" aria-label="Close dialog">×</button>
        </div>
        <div class="modal-body">
          <ng-content select="[modal-body]" />
        </div>
        <div class="modal-footer">
          <ng-content select="[modal-footer]" />
        </div>
      </div>
    </div>
  `,
})
export class ModalShellComponent {
  readonly title = input.required<string>();
  readonly dismissible = input<boolean>(true);
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dismissible()) this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.dismissible() && event.target === event.currentTarget) this.closed.emit();
  }
}
