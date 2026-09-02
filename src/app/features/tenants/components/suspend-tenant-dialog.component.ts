import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalShellComponent } from '../../../shared/components/modal-shell/modal-shell.component';
import { TenantsService } from '../tenants.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Tenant } from '../../../core/models/domain.model';

@Component({
  selector: 'app-suspend-tenant-dialog',
  standalone: true,
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './suspend-tenant-dialog.component.html',
})
export class SuspendTenantDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tenantsService = inject(TenantsService);
  private readonly notifications = inject(NotificationService);

  readonly tenant = input.required<Tenant>();
  readonly submitting = signal(false);
  readonly cancelled = output<void>();
  readonly suspended = output<void>();

  readonly reasons = ['Non-payment', 'Policy breach', 'Client requested pause', 'Security concern'];

  readonly form = this.fb.nonNullable.group({
    reason: [this.reasons[0], Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.tenantsService.suspend(this.tenant().id, this.form.getRawValue().reason).subscribe({
      next: () => {
        this.notifications.error('Tenant suspended', `${this.tenant().name} — publishing and spend stopped`);
        this.suspended.emit();
      },
      error: () => this.submitting.set(false),
    });
  }
}
