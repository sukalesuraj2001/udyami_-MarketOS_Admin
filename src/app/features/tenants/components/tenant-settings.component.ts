import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DigitalUser } from '../../../core/models/domain.model';
import { TenantsService } from '../tenants.service';
import {
  AccountCredential,
  AccountCredentialsService,
} from '../account-credentials.service';

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tenant-settings.component.html',
  styleUrl: './tenant-settings.component.scss',
})
export class TenantSettingsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly tenantsService = inject(TenantsService);
  private readonly credentialsService = inject(AccountCredentialsService);
  private readonly userId = this.route.snapshot.paramMap.get('userId') ?? '';

  readonly user = signal<DigitalUser | null>(null);
  readonly accounts = signal<AccountCredential[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly savingId = signal<string | null>(null);
  readonly copiedId = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly credentialForm = this.formBuilder.nonNullable.group({
    accountId: ['', Validators.required],
    accessToken: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      users: this.tenantsService.list(),
      accounts: this.credentialsService.list(),
    }).subscribe({
      next: ({ users, accounts }) => {
        this.user.set(users.find((candidate) => candidate.userId === this.userId) ?? null);
        this.accounts.set(accounts.filter((account) => account.userId === this.userId));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load account credentials. Please try again.');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/tenants']);
  }

  startEdit(account: AccountCredential): void {
    this.editingId.set(account.id);
    this.credentialForm.setValue({
      accountId: account.accountId ?? '',
      accessToken: account.accessToken ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.credentialForm.reset();
  }

  save(account: AccountCredential): void {
    if (this.credentialForm.invalid) {
      this.credentialForm.markAllAsTouched();
      return;
    }

    this.savingId.set(account.id);
    this.credentialsService.update(account.id, this.credentialForm.getRawValue()).subscribe({
      next: (updated) => {
        this.accounts.update((items) => items.map((item) => item.id === account.id ? { ...item, ...updated } : item));
        this.savingId.set(null);
        this.cancelEdit();
        this.showSuccess(`${account.platform} token and account ID saved successfully.`);
      },
      error: () => {
        this.savingId.set(null);
        this.error.set('The account details could not be saved. Please try again.');
      },
    });
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    window.setTimeout(() => this.successMessage.set(null), 3600);
  }

  copyPassword(account: AccountCredential): void {
    if (!account.password) return;

    void navigator.clipboard.writeText(account.password).then(() => {
      this.copiedId.set(account.id);
      window.setTimeout(() => {
        if (this.copiedId() === account.id) this.copiedId.set(null);
      }, 1800);
    });
  }

  initials(): string {
    return (this.user()?.name ?? 'User')
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
