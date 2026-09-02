import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalShellComponent } from '../../../shared/components/modal-shell/modal-shell.component';
import { TenantsService } from '../tenants.service';
import { NotificationService } from '../../../core/services/notification.service';

const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/;

@Component({
  selector: 'app-provision-tenant-dialog',
  standalone: true,
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './provision-tenant-dialog.component.html',
})
export class ProvisionTenantDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tenantsService = inject(TenantsService);
  private readonly notifications = inject(NotificationService);

  readonly submitting = signal(false);
  readonly cancelled = output<void>();
  readonly provisioned = output<void>();

  readonly plans = ['Starter — ₹35,000/mo', 'Growth — ₹55,000/mo', 'Scale — ₹75,000/mo'];

  readonly form = this.fb.nonNullable.group({
    businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    gstNumber: ['', [Validators.required, Validators.pattern(GST_PATTERN)]],
    plan: [this.plans[0], Validators.required],
    ownerEmail: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.tenantsService.provision(value).subscribe({
      next: () => {
        this.notifications.success('Tenant provisioned', 'Onboarding link sent');
        this.provisioned.emit();
      },
      error: () => this.submitting.set(false),
    });
  }
}
