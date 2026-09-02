# MarketOS — Admin Console

Production Angular 20 rebuild of the MarketOS Admin Console prototype. Same
product, same visual identity, same terminology — rebuilt as a strongly
typed, modular, API-ready enterprise application.

## Contents

- [Architecture](#architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Development](#development)
- [Environment configuration](#environment-configuration)
- [Authentication architecture](#authentication-architecture)
- [API architecture & mock layer](#api-architecture--mock-layer)
- [Theme system](#theme-system)
- [Folder structure](#folder-structure)
- [Testing](#testing)
- [Linting & formatting](#linting--formatting)
- [Production build](#production-build)
- [Deployment](#deployment)
- [What's implemented vs. scaffolded](#whats-implemented-vs-scaffolded)
- [Backend API contract](#backend-api-contract-required-from-nestjs)
- [Known assumptions](#known-assumptions)

## Architecture

- **Angular 20**, standalone components throughout (no NgModules)
- **Signals** for local/UI state (auth session, theme, toasts, loading flags)
- **RxJS** for HTTP and async flows
- **Reactive Forms** for every input surface (login, provision tenant,
  impersonate, suspend, platform halt)
- **Lazy-loaded routes** per feature (`loadComponent`), so the initial
  bundle only contains the shell + login
- **HttpClient + functional interceptors** (`authInterceptor`,
  `errorInterceptor`, `mockApiInterceptor`) — no service ever attaches an
  `Authorization` header manually
- **SCSS design tokens** (`src/styles/_tokens.scss`) ported 1:1 from the
  prototype's `:root` custom properties

## Requirements

- Node.js 20+ (built and tested against Node 22)
- npm 10+

## Installation

```bash
npm install
```

## Development

```bash
npm start        # ng serve — http://localhost:4200
```

The app runs **fully click-through-able with no backend** — `mockApiInterceptor`
simulates the NestJS API in-browser, seeded with the same tenant/incident/job
data as the original prototype. Demo credentials are pre-filled on the login
screen:

| Role | Email | Password |
|---|---|---|
| Super Admin | `yogesh@jyovix.in` | `admin123` |
| Editor | `asha@jyovix.in` | `editor123` |

Editor accounts are routed away from Feature Flags and Audit Log by
`roleGuard` (see [Authentication architecture](#authentication-architecture)).

## Environment configuration

`src/environments/environment.ts` (dev) and `environment.prod.ts` (prod):

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  useMockApi: true, // set false once the real API is available
};
```

No secrets live in these files — configuration only, per section 26 of the
architecture brief. `useMockApi` is the single switch that moves the whole
app from the in-browser mock to a real backend; no component or service
changes are required either way.

## Authentication architecture

```
Login form (Reactive Forms)
        │
        ▼
AuthService.login()  ──POST /auth/login──▶  backend
        │
        ▼
AuthStore.setSession(user, tokens)   (signals; mirrored to localStorage)
        │
        ▼
Every subsequent HttpClient call
        │
        ▼
authInterceptor: attaches "Authorization: Bearer <accessToken>"
        │
        ├─ 401 response? ──▶ authInterceptor refreshes once (single-flight —
        │                    concurrent 401s all await the same refresh call,
        │                    never fire N refreshes) and retries the request
        │
        └─ refresh fails ──▶ AuthStore.clear() + redirect to /login
```

- `AuthStore` — signals for `user`, `isAuthenticated`, `accessToken`. This is
  **session/UI state, not an authorization source of truth**.
- `authGuard` — blocks route access when not authenticated, redirects to
  `/login?redirectTo=<attempted url>`.
- `roleGuard(allowedRoles)` — blocks `/admin/feature-flags` and `/admin/audit`
  for the `EDITOR` role. **This is a UX convenience, not security** — per
  section 41/25 of the brief, the backend must independently re-validate role
  and permission on every request. The frontend never assumes a role claim
  read from `localStorage` is trustworthy.
- Tokens are never hardcoded, never logged (`LoggerService` redacts any key
  matching `/token|password|secret|authorization/i` before it reaches
  `console`), and never attached manually by a feature service.

## API architecture & mock layer

All endpoint paths live in one place: `src/app/core/api/api.constants.ts`.
Feature services (`TenantsService`, `JobsService`, etc.) import from there —
no hardcoded URL strings anywhere else.

Responses are typed with `ApiResponse<T>` and `PaginatedResponse<T>`
(`src/app/core/api/api-response.model.ts`), matching the contract this
README asks the backend team to implement (see below).

**`mockApiInterceptor`** (`src/app/core/mock/mock-api.interceptor.ts`) is a
functional `HttpInterceptorFn` that pattern-matches on
`${apiBaseUrl}${path}` + HTTP method and returns realistic responses (with
~260ms simulated latency) from an in-memory store seeded with the original
prototype's data (`mock-db.ts`). It only activates when
`environment.useMockApi === true` and the request targets `apiBaseUrl` — so
flipping that one flag to `false` in `environment.prod.ts` removes it from
the request pipeline entirely, with zero changes anywhere else.

## Theme system

`ThemeService` (`src/app/core/services/theme.service.ts`) supports `dark` /
`light` / `system`, persisted to `localStorage`, applied via a
`data-theme` attribute on `<html>` that every SCSS token in
`_tokens.scss` keys off. `ThemeService.applyBeforeBootstrap()` runs
synchronously in `main.ts`, **before** `bootstrapApplication` — so the
correct theme paints on the very first frame, no flash of the wrong theme.

Dark is the prototype's native theme (gold-on-charcoal); light is a
professional equivalent built from the same semantic token names
(`--color-primary`, `--color-danger`, etc.) rather than a duplicated
component stylesheet per theme.

## Folder structure

```
src/app/
├── core/           # auth, api constants/models, cross-cutting services, mock API
├── shared/          # design-system components (kpi-card, status-tag, modal-shell, toast…)
├── layout/           # admin shell: sidebar, topbar, responsive nav
├── auth/             # login, unauthorized pages
└── features/         # dashboard, tenants, incidents, jobs, quota, usage, feature-flags, audit
    └── <feature>/
        ├── <feature>.service.ts
        ├── <feature>.component.ts(+html)
        └── components/   # sub-components + dialogs specific to that feature
```

## Testing

```bash
npm test
```

Uses Angular's Karma/Jasmine test builder (the current default for Angular
20 standalone apps). Representative specs are included and passing:

- `core/services/theme.service.spec.ts` — default theme, persistence,
  re-read on next load
- `core/auth/guards/auth.guard.spec.ts` — allows authenticated navigation,
  redirects unauthenticated users with the attempted URL preserved

**Not yet covered** (flagged honestly rather than faked): `AuthService`
login/refresh flows, `authInterceptor`'s single-flight refresh behavior,
`roleGuard`, and each feature service's mock-API round trip. The pattern
established by the two specs above (`TestBed` + signal assertions,
`TestBed.runInInjectionContext` for functional guards) extends directly to
the rest — this is the natural next increment.

> This sandbox has no networked Chrome, so tests were run against a
> pinned Puppeteer Chromium binary with a `--no-sandbox` Karma launcher
> (see `karma.conf.js`). A normal CI/dev machine just needs Chrome
> installed — no special config required.

## Linting & formatting

```bash
npm run lint           # ng lint — angular-eslint + typescript-eslint
npm run format          # prettier --write
npm run format:check
```

Currently: **0 lint errors, 0 warnings** across the whole `src/` tree.

## Production build

```bash
npm run build
```

Outputs to `dist/marketos-admin/`, lazy-chunked per feature route. Verified:
zero TypeScript errors, zero template errors, zero ESLint errors, no
hardcoded `localhost` API URL in the production environment file.

> **Font inlining note:** `angular.json`'s production config sets
> `optimization.fonts: false`. This build environment has no outbound
> network access to `fonts.googleapis.com`, which the build-time font
> inliner needs. On a normal machine (or CI with internet access) this can
> be safely removed/set to `true` (Angular's default) so fonts get inlined
> into the CSS at build time instead of fetched at runtime.

## Deployment

The output of `npm run build` is a static bundle — deploy `dist/marketos-admin/`
to any static host (S3+CloudFront, Netlify, nginx, etc.) with the SPA
fallback rule (`index.html`) configured for the Angular router's HTML5
history mode, matching the `<base href="/">` in `src/index.html`.

## What's implemented vs. scaffolded

**Fully implemented, end-to-end (form → service → mock API → UI update →
toast):**
Dashboard (KPIs, attention panel, margin-by-tenant, platform halt with
"type HALT" confirmation), Tenants (table, filter, provision/impersonate/
suspend dialogs with validated reactive forms), Incidents, Job Queue
(including bulk retry with confirmation), API Quota, Usage & Margin
(including credit top-up and CSV export triggers), Feature Flags (with
locked-flag handling and optimistic-update rollback on failure), Audit Log
(filterable, export, strictly read-only UI).

**Established pattern, not yet extended:**
- Full unit test coverage across all services/guards/interceptors (2
  representative specs are in place and passing — see Testing)
- `TenantDetailsComponent` (view-only tenant drill-down) — not built; the
  table's "Impersonate"/"Suspend" actions are, but a dedicated detail view
  wasn't in the original prototype either
- Server-driven pagination — `PaginatedResponse<T>` is wired end-to-end but
  the mock API always returns a single page (all rows), since the seed
  datasets are small; a real backend returning `page`/`totalPages` needs no
  frontend change to start paginating, but no pager UI component exists yet

## Backend API contract (required from NestJS)

Every endpoint the frontend calls is enumerated in
`src/app/core/api/api.constants.ts`, and the exact request/response shapes
it expects are visible in each `mockApiInterceptor` branch
(`src/app/core/mock/mock-api.interceptor.ts`) — that file **is** the
executable spec for the backend team: each `if` block documents the method,
path, request body, and `ApiResponse<T>` shape a real controller needs to
return.

## Known assumptions

- Prototype data (Sri Lakshmi Industries, Nandi Foods, etc.) is treated
  purely as illustrative — it ships only as mock-API seed data, never
  hardcoded into a component.
- "Editor" role is assumed to have access to every module except Feature
  Flags and Audit Log; the prototype didn't specify per-role access, so
  this is the most conservative reasonable interpretation and is isolated
  to one array in `admin-layout.component.ts` + `app.routes.ts` if it needs
  to change.
- Impersonation "consent" is modeled as a *request* the tenant must
  separately approve (per the prototype's own copy: "This needs their
  consent... they'll get a prompt") — the frontend never grants a live
  impersonation session directly.
