import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth.store';
import { AppRole } from '../models/user.model';

/**
 * Route-level UI gate only. This decides whether the *frontend renders*
 * a screen — it is not a security boundary. The backend re-validates the
 * user's role on every request (see architecture section 41).
 */
export const roleGuard = (allowed: AppRole[]): CanActivateFn => {
  return () => {
    const store = inject(AuthStore);
    const router = inject(Router);
    const roles = store.user()?.roles ?? [];

    if (roles.some((role) => (allowed as string[]).includes(role))) return true;

    return router.createUrlTree(['/unauthorized']);
  };
};
