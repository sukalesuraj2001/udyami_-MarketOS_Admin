import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { AppRole } from './core/auth/models/user.model';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin/overview' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./auth/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/tenants/tenants.component').then((m) => m.TenantsComponent),
      },
      {
        path: 'incidents',
        loadComponent: () => import('./features/incidents/incidents.component').then((m) => m.IncidentsComponent),
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/jobs.component').then((m) => m.JobsComponent),
      },
      {
        path: 'quota',
        loadComponent: () => import('./features/quota/components/quota.component').then((m) => m.QuotaComponent),
      },
      {
        path: 'usage',
        loadComponent: () => import('./features/usage/components/usage.component').then((m) => m.UsageComponent),
      },
      {
        path: 'feature-flags',
        canActivate: [roleGuard([AppRole.SuperAdmin])],
        loadComponent: () => import('./features/feature-flags/components/feature-flags.component').then((m) => m.FeatureFlagsComponent),
      },
      {
        path: 'audit',
        canActivate: [roleGuard([AppRole.SuperAdmin])],
        loadComponent: () => import('./features/audit/components/audit.component').then((m) => m.AuditComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'admin/overview' },
];
