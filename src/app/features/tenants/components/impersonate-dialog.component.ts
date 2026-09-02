import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalShellComponent } from '../../../shared/components/modal-shell/modal-shell.component';
import { TenantsService } from '../tenants.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Tenant } from '../../../core/models/domain.model';

/**
 * Impersonation is never silent: this dialog requires a stated reason and
 * a bounded session length, and only *requests* consent — it never grants
 * a session directly. Every request is written to the audit log server-side.
 */
@Component({
  selector: 'app-impersonate-dialog',
  standalone: true,
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './impersonate-dialog.component.html',
})
export class ImpersonateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tenantsService = inject(TenantsService);
  private readonly notifications = inject(NotificationService);

  readonly tenant = input.required<Tenant>();
  readonly submitting = signal(false);
  readonly cancelled = output<void>();
  readonly requested = output<void>();

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(10)]],
    sessionMinutes: [30, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const { reason, sessionMinutes } = this.form.getRawValue();
    this.tenantsService.requestImpersonationConsent(this.tenant().id, reason, sessionMinutes).subscribe({
      next: () => {
        this.notifications.success('Consent requested', `${this.tenant().name} — waiting on their approval`);
        this.requested.emit();
      },
      error: () => this.submitting.set(false),
    });
  }
}
