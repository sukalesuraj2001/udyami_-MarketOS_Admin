import { Component, input, output } from '@angular/core';
import { ModalShellComponent } from '../modal-shell/modal-shell.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalShellComponent],
  template: `
    <app-modal-shell [title]="title()" (closed)="cancelled.emit()">
      <p modal-body style="font-size:13.5px;color:var(--color-text-muted);line-height:1.7">{{ message() }}</p>
      <ng-container modal-footer>
        <button type="button" class="btn" (click)="cancelled.emit()">{{ cancelLabel() }}</button>
        <button type="button" class="btn" [class.btn-danger]="danger()" [class.btn-gold]="!danger()" (click)="confirmed.emit()">
          {{ confirmLabel() }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly danger = input<boolean>(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
