import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { homeRedirectGuard } from './core/auth/guards/home-redirect.guard';
import { AppRole } from './core/auth/models/user.model';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
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
    canActivate: [authGuard, roleGuard([AppRole.SuperAdmin])],
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
  {
    path: 'editor',
    canActivate: [authGuard, roleGuard([AppRole.Editor])],
    loadComponent: () => import('./layout/editor-layout/editor-layout.component').then((m) => m.EditorLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'queue' },
      {
        path: 'queue',
        data: { statusFilter: 'active', pageTitle: 'My Queue', pageSubtitle: 'Everything pending or in progress, across all tenants.' },
        loadComponent: () => import('./features/editor/components/editor-queue.component').then((m) => m.EditorQueueComponent),
      },
      {
        path: 'pending',
        data: { statusFilter: 'pending', pageTitle: 'Pending', pageSubtitle: 'Tasks not started yet.' },
        loadComponent: () => import('./features/editor/components/editor-queue.component').then((m) => m.EditorQueueComponent),
      },
      {
        path: 'in-progress',
        data: { statusFilter: 'in_progress', pageTitle: 'In Progress', pageSubtitle: 'Tasks currently being edited.' },
        loadComponent: () => import('./features/editor/components/editor-queue.component').then((m) => m.EditorQueueComponent),
      },
      {
        path: 'history',
        loadComponent: () => import('./features/editor/components/editor-history.component').then((m) => m.EditorHistoryComponent),
      },
    ],
  },
  { path: '**', canActivate: [homeRedirectGuard], children: [] },
];
