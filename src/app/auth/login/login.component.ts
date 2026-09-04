import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { AuthStore } from '../../core/auth/auth.store';
import { AppRole } from '../../core/auth/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const requested = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(this.resolveRedirect(requested));
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Unable to sign in. Please try again.');
      },
      complete: () => this.submitting.set(false),
    });
  }

  /**
   * `/admin/...` has no role guard beyond authentication (only feature-flags
   * and audit are SuperAdmin-gated) — so an Editor-only account landing there
   * via a stale `redirectTo` (e.g. `/` -> `admin/overview` -> bounced to
   * login) would silently see the SuperAdmin shell instead of their own.
   * Only honor `redirectTo` into `/admin` when the user is actually a
   * SuperAdmin; otherwise fall back to the role-appropriate default.
   */
  private resolveRedirect(requested: string | null): string {
    const roles = this.authStore.user()?.roles ?? [];
    const isSuperAdmin = roles.includes(AppRole.SuperAdmin);
    const isEditor = roles.includes(AppRole.Editor);

    if (requested && !(requested.startsWith('/admin') && !isSuperAdmin)) {
      return requested;
    }

    if (isSuperAdmin) return '/admin/overview';
    if (isEditor) return '/editor';
    return '/admin/overview';
  }
}
