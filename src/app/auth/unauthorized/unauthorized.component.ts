import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { AppRole } from '../../core/auth/models/user.model';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh;display:grid;place-items:center;text-align:center;padding:20px">
      <div>
        <h1 style="font-size:22px;margin-bottom:10px">You don't have access to this page</h1>
        <p style="color:var(--color-text-muted);margin-bottom:18px">Your role doesn't include this module. Ask a Super Admin if you believe this is a mistake.</p>
        <a class="btn btn-gold" [routerLink]="backPath">Back to overview</a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  private readonly authStore = inject(AuthStore);

  /** SuperAdmin goes back to the admin overview; Editor-only accounts go back to their queue. */
  get backPath(): string {
    const roles = this.authStore.user()?.roles ?? [];
    if (roles.includes(AppRole.Editor) && !roles.includes(AppRole.SuperAdmin)) return '/editor';
    return '/admin/overview';
  }
}
