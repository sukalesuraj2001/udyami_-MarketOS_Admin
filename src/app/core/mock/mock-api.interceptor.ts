import { inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../api/api.constants';
import { PaginatedResponse } from '../api/api-response.model';
import { Tenant } from '../models/domain.model';
import { mockDb, computeDashboardSummary } from './mock-db';
import { LoggerService } from '../services/logger.service';

const LATENCY_MS = 260;

// Every branch below hands back an HttpEvent<unknown> — the interceptor's
// contractual return type — so call sites don't need a per-call `any` cast
// just to satisfy the union of concrete response body types.
function ok<T>(data: T): Observable<HttpEvent<unknown>> {
  return of(
    new HttpResponse({ status: 200, body: { success: true, message: 'OK', data, timestamp: new Date().toISOString() } }),
  ).pipe(delay(LATENCY_MS)) as Observable<HttpEvent<unknown>>;
}

function paginated<T>(items: T[]): Observable<HttpEvent<unknown>> {
  return ok<PaginatedResponse<T>>({ items, total: items.length, page: 1, limit: items.length || 1, totalPages: 1 });
}

function fail(status: number, message: string): Observable<never> {
  return throwError(
    () => new HttpErrorResponse({ status, error: { success: false, message, statusCode: status } }),
  ).pipe(delay(LATENCY_MS));
}

/**
 * Simulates the NestJS admin API entirely in the browser so the app is
 * fully click-through-able with no backend running. Every branch here is
 * a 1:1 stand-in for a real controller action — swap `useMockApi` off in
 * environment.ts and this interceptor is simply not registered
 * (see app.config.ts), no component changes required.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi || !req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const logger = inject(LoggerService);
  const path = req.url.replace(environment.apiBaseUrl, '');
  const e = API_ENDPOINTS;
  logger.debug(`[mock-api] ${req.method} ${path}`);

  // ---- Auth ----
  // Auth is handled entirely by the real backend now (see AuthService) —
  // no dummy tokens are minted here.

  // ---- Dashboard ----
  if (path === e.dashboard.root && req.method === 'GET') {
    return ok(computeDashboardSummary());
  }

  // ---- Tenants ----
  if (path === e.tenants.root && req.method === 'GET') {
    return paginated(mockDb.tenants);
  }
  if (path === e.tenants.root && req.method === 'POST') {
    const body = req.body as { businessName: string; plan: string; ownerEmail: string };
    mockDb.tenants.push({
      id: `t${mockDb.tenants.length + 1}`,
      name: body.businessName,
      segment: 'Onboarding',
      plan: (body.plan as Tenant['plan']) ?? 'Starter',
      healthScore: null,
      aiCost: '₹0',
      margin: '—',
      approvalSla: '—',
      status: 'onboarding',
      healthTier: 'onboarding',
    });
    return ok(mockDb.tenants[mockDb.tenants.length - 1]);
  }
  const suspendMatch = mockDb.tenants.find((t) => path === e.tenants.suspend(t.id) && req.method === 'POST');
  if (suspendMatch) {
    suspendMatch.status = 'suspended';
    suspendMatch.healthTier = 'risk';
    return ok(suspendMatch);
  }
  const impMatch = mockDb.tenants.find((t) => path === e.tenants.impersonationRequest(t.id) && req.method === 'POST');
  if (impMatch) {
    return ok({ requested: true });
  }

  // ---- Incidents ----
  if (path === e.incidents.root && req.method === 'GET') {
    return paginated(mockDb.incidents);
  }
  const dismissMatch = mockDb.incidents.find((i) => path === e.incidents.dismiss(i.id) && req.method === 'POST');
  if (dismissMatch) {
    mockDb.incidents = mockDb.incidents.filter((i) => i.id !== dismissMatch.id);
    return ok({ dismissed: true });
  }

  // ---- Jobs ----
  if (path === e.jobs.root && req.method === 'GET') {
    const failed24h = mockDb.jobs.filter((j) => j.status === 'failed').length;
    const queued = mockDb.jobs.filter((j) => j.status === 'queued').length;
    const running = mockDb.jobs.filter((j) => j.status === 'running').length;
    return ok({ jobs: mockDb.jobs, summary: { queued: queued + 41, running, failed24h, medianDurationSeconds: 4.2 } });
  }
  const retryMatch = mockDb.jobs.find((j) => path === e.jobs.retry(j.id) && req.method === 'POST');
  if (retryMatch) {
    retryMatch.status = 'queued';
    retryMatch.attempts += 1;
    retryMatch.error = '—';
    return ok(retryMatch);
  }
  if (path === e.jobs.retryFailed && req.method === 'POST') {
    const failed = mockDb.jobs.filter((j) => j.status === 'failed');
    failed.forEach((j) => { j.status = 'queued'; j.attempts += 1; j.error = '—'; });
    return ok({ requeued: failed.length });
  }

  // ---- Quota ----
  if (path === e.quota.root && req.method === 'GET') {
    return ok(mockDb.quota);
  }

  // ---- Usage ----
  if (path === e.usage.root && req.method === 'GET') {
    return ok(mockDb.usage);
  }
  if (path === e.usage.export && req.method === 'GET') {
    return ok({ downloadUrl: '#', queued: true });
  }

  // ---- Feature flags ----
  if (path.startsWith(e.featureFlags.root) && req.method === 'GET') {
    const tenantName = req.params.get('tenant') ?? Object.keys(mockDb.featureFlagsByTenant)[0];
    return ok({ tenantName, flags: mockDb.featureFlagsByTenant[tenantName] ?? [] });
  }
  for (const flags of Object.values(mockDb.featureFlagsByTenant)) {
    const flag = flags.find((f) => path === e.featureFlags.byId(f.id) && req.method === 'PATCH');
    if (flag) {
      if (flag.locked) return fail(422, 'Both gates must pass before this feature can be enabled.');
      flag.enabled = (req.body as { enabled?: boolean } | null)?.enabled ?? !flag.enabled;
      return ok(flag);
    }
  }

  // ---- Audit ----
  if (path === e.audit.root && req.method === 'GET') {
    const kind = req.params.get('kind');
    const rows = kind && kind !== 'all' ? mockDb.audit.filter((a) => a.kind === kind) : mockDb.audit;
    return paginated(rows);
  }
  if (path === e.audit.export && req.method === 'GET') {
    return ok({ downloadUrl: '#', queued: true });
  }

  // ---- Platform ----
  if (path === e.platform.halt && req.method === 'POST') {
    return ok({ halted: true, tenantsAffected: mockDb.tenants.filter((t) => t.status === 'active').length });
  }

  return fail(404, `No mock handler for ${req.method} ${path}`);
};
