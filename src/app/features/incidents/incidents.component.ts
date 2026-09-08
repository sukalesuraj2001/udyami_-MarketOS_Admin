import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Incident } from '../../core/models/domain.model';
import { DigitalUser } from '../../core/models/domain.model';
import { NotificationService } from '../../core/services/notification.service';
import { IncidentsService } from './incidents.service';
import { TenantsService } from '../tenants/tenants.service';

@Component({
  selector: 'app-incidents-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './incidents.component.html',
  styles: [`
    :host { display:block; }
    .incident-intro { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:25px; }
    .eyebrow { color:var(--color-primary); font-size:10px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
    .incident-intro h1 { margin:7px 0 5px; font-size:26px; letter-spacing:-.02em; }
    .incident-intro p { margin:0; color:var(--color-text-muted); font-size:13px; }
    .live-pulse { display:flex; align-items:center; gap:8px; border:1px solid rgba(63,178,127,.3); border-radius:20px; padding:7px 11px; color:var(--color-success); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
    .live-pulse i { width:7px; height:7px; border-radius:50%; background:var(--color-success); box-shadow:0 0 0 0 rgba(63,178,127,.7); animation:live-ring 1.8s infinite; }
    .signal-board { display:grid; gap:14px; }
    .signal-card { position:relative; overflow:hidden; display:grid; grid-template-columns:52px minmax(0,1fr) auto; gap:16px; align-items:start; padding:19px; border:1px solid var(--color-border); border-radius:12px; background:linear-gradient(115deg,var(--color-surface),var(--color-surface-secondary)); animation:signal-enter .5s both; transition:transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
    .signal-card:nth-child(2) { animation-delay:.1s; }
    .signal-card::after { content:""; position:absolute; width:190px; height:190px; right:-75px; top:-95px; border-radius:50%; border:1px solid var(--signal-color); opacity:.18; box-shadow:0 0 0 18px rgba(255,255,255,.015),0 0 0 36px rgba(255,255,255,.01); pointer-events:none; }
    .signal-card:hover { transform:translateY(-4px); border-color:var(--signal-color); box-shadow:0 16px 32px rgba(0,0,0,.2); }
    .signal-icon { position:relative; z-index:1; width:46px; height:46px; display:grid; place-items:center; border-radius:13px; color:var(--signal-color); border:1px solid color-mix(in srgb,var(--signal-color) 45%, transparent); background:color-mix(in srgb,var(--signal-color) 13%, transparent); font-size:21px; animation:icon-breathe 2.8s ease-in-out infinite; }
    .signal-main { min-width:0; }
    .signal-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
    .signal-severity { color:var(--signal-color); font-size:10px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
    .signal-time { color:var(--color-text-dim); font-size:10px; }
    .signal-card h2 { margin:0 0 7px; font-size:16px; line-height:1.3; }
    .signal-owner { display:flex; flex-wrap:wrap; gap:12px; margin:0 0 8px; color:var(--color-text-dim); font-size:11px; }
    .signal-owner span + span { padding-left:12px; border-left:1px solid var(--color-border); }
    .signal-card p { margin:0; max-width:72ch; color:var(--color-text-muted); font-size:12.5px; line-height:1.6; }
    .signal-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:13px; }
    .signal-tag { padding:4px 7px; border-radius:5px; background:var(--color-surface-tertiary); color:var(--color-text-dim); font-size:10px; font-weight:700; }
    .signal-impact { grid-column:2 / 3; display:grid; grid-template-columns:auto minmax(120px,1fr) auto; align-items:center; gap:8px; margin-top:16px; color:var(--color-text-dim); font-size:10px; }
    .impact-bar { height:5px; overflow:hidden; border-radius:4px; background:var(--color-surface-tertiary); }
    .impact-bar i { display:block; height:100%; width:var(--impact); border-radius:inherit; background:var(--signal-color); animation:bar-grow .9s .35s both; transform-origin:left; }
    .impact-score { color:var(--signal-color); font-family:'JetBrains Mono',monospace; font-weight:800; }
    .signal-actions { position:relative; z-index:2; display:flex; gap:7px; align-items:center; }
    .signal-actions button { white-space:nowrap; }
    .empty-signal { padding:30px; text-align:center; color:var(--color-text-muted); border:1px dashed var(--color-border); border-radius:10px; }
    @keyframes signal-enter { from { opacity:0; transform:translateY(15px); } to { opacity:1; transform:none; } }
    @keyframes icon-breathe { 0%,100% { box-shadow:0 0 0 0 color-mix(in srgb,var(--signal-color) 0%, transparent); } 50% { box-shadow:0 0 0 7px color-mix(in srgb,var(--signal-color) 8%, transparent); } }
    @keyframes bar-grow { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    @keyframes live-ring { 70% { box-shadow:0 0 0 6px rgba(63,178,127,0); } 100% { box-shadow:0 0 0 0 rgba(63,178,127,0); } }
    @media (max-width:700px) { .incident-intro { align-items:flex-start; flex-direction:column; } .signal-card { grid-template-columns:42px minmax(0,1fr); gap:12px; padding:15px; } .signal-icon { width:40px; height:40px; } .signal-actions { grid-column:2; } .signal-impact { grid-column:2; } }
  `],
})
export class IncidentsComponent {
  private readonly incidentsService = inject(IncidentsService);
  private readonly tenantsService = inject(TenantsService);
  private readonly notifications = inject(NotificationService);

  readonly incidents = signal<Incident[]>([]);
  readonly users = signal<Record<string, DigitalUser>>({});
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({ incidents: this.incidentsService.list(), users: this.tenantsService.list() }).subscribe({
      next: ({ incidents, users }) => {
        this.incidents.set(incidents);
        this.users.set(Object.fromEntries(users.map((user) => [user.userId, user])));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notifications.error('Unable to load incidents', 'Please try again later.');
      },
    });
  }

  impact(incident: Incident): string {
    return incident.severity === 'CRITICAL' ? '100%' : incident.severity === 'HIGH' ? '84%' : '57%';
  }
  icon(incident: Incident): string { return incident.severity === 'CRITICAL' ? '!' : '~'; }
  severityLabel(incident: Incident): string { return incident.severity.replaceAll('_', ' '); }
  signalColor(incident: Incident): string {
    return incident.severity === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-warning)';
  }

  userName(incident: Incident): string {
    return incident.userId ? this.users()[incident.userId]?.name || 'Unknown user' : 'Unknown user';
  }

  businessName(incident: Incident): string {
    return incident.userId
      ? this.users()[incident.userId]?.profile?.businessDetails?.businessName || 'Business not available'
      : 'Business not available';
  }

  resolve(incident: Incident): void {
    if (incident.resolved || incident.status === 'RESOLVED') return;

    this.incidentsService.resolve(incident).subscribe({
      next: (updatedIncident) => {
        this.incidents.update((list) => list.map((item) => item.id === updatedIncident.id ? updatedIncident : item));
        this.notifications.success('Incident resolved', updatedIncident.title);
      },
      error: () => this.notifications.error('Unable to resolve incident', 'Please try again later.'),
    });
  }
}
