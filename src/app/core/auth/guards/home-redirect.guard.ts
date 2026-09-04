import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth.store';
import { AppRole } from '../models/user.model';

/**
 * Root ('') entry point. The landing route depends on auth + role, so it
 * can't be a static `redirectTo` string: SuperAdmin lands on the admin
 * overview, Editor-only accounts land on their own queue, unauthenticated
 * visitors go to login.
 */
export const homeRedirectGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isAuthenticated()) return router.createUrlTree(['/login']);

  const roles = store.user()?.roles ?? [];
  if (roles.includes(AppRole.SuperAdmin)) return router.createUrlTree(['/admin/overview']);
  if (roles.includes(AppRole.Editor)) return router.createUrlTree(['/editor']);
  return router.createUrlTree(['/admin/overview']);
};
