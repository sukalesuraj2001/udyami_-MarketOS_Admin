import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalShellComponent } from '../../../shared/components/modal-shell/modal-shell.component';
import { DashboardService } from '../dashboard.service';
import { NotificationService } from '../../../core/services/notification.service';

function mustEqualHalt(control: { value: string }): { mismatch: true } | null {
  return (control.value ?? '').trim().toUpperCase() === 'HALT' ? null : { mismatch: true };
}

@Component({
  selector: 'app-platform-halt-dialog',
  standalone: true,
  imports: [ModalShellComponent, ReactiveFormsModule],
  template: `
    <app-modal-shell title="Halt the whole platform?" (closed)="cancelled.emit()">
      <ng-container modal-body>
        <div class="alert alert-danger">
          <span>▲</span>
          <span><b>This affects all {{ activeTenantCount() }} active tenants</b>
            <span class="alert-sub">Every scheduled post holds and every live campaign pauses. Use this for a platform incident, not a single tenant's problem.</span>
          </span>
        </div>
        <form [formGroup]="form">
          <div class="field" style="margin-bottom:0">
            <label for="haltConfirm">Type HALT to confirm</label>
            <input id="haltConfirm" class="inp mono" formControlName="confirmText" placeholder="HALT" />
          </div>
        </form>
      </ng-container>
      <ng-container modal-footer>
        <button type="button" class="btn" (click)="cancelled.emit()">Cancel</button>
        <button type="button" class="btn btn-danger" [disabled]="submitting()" (click)="confirm()">
          {{ submitting() ? 'Halting…' : 'Halt platform' }}
        </button>
      </ng-container>
    </app-modal-shell>
  `,
})
export class PlatformHaltDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dashboardService = inject(DashboardService);
  private readonly notifications = inject(NotificationService);

  readonly activeTenantCount = signal(10);
  readonly submitting = signal(false);
  readonly cancelled = output<void>();
  readonly halted = output<void>();

  readonly form = this.fb.nonNullable.group({
    confirmText: ['', [Validators.required, mustEqualHalt]],
  });

  confirm(): void {
    if (this.form.invalid) {
      this.notifications.warning('Type HALT to confirm', 'Nothing has changed.');
      return;
    }
    this.submitting.set(true);
    this.dashboardService.haltPlatform().subscribe({
      next: (result) => {
        this.notifications.error('Platform halted', `${result.tenantsAffected} tenants · all publishing and spend stopped`);
        this.halted.emit();
      },
      error: () => this.submitting.set(false),
    });
  }
}
