import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DigitalUser } from '../../../core/models/domain.model';
import { StorageService } from '../../../core/services/storage.service';
import { MarketingCalendar, MarketingCalendarEntry, MarketingCalendarService } from '../marketing-calendar.service';
import { GeneratedContentItem, GeneratedContentPayload, GeneratedContentService } from '../generated-content.service';
import { TenantsService } from '../tenants.service';

type CalendarDay = { date: number; iso: string; isToday: boolean; isCurrentMonth: boolean };

@Component({
  selector: 'app-tenant-calendar',
  standalone: true,
  template: `
    <main class="calendar-page">
      <div class="calendar-heading">
        <div>
          <button class="back-link" type="button" (click)="goBack()">← Back to tenants</button>
          <div class="eyebrow">SUPER ADMIN · CONTENT VISIBILITY</div>
          <h1>{{ user()?.name || 'Tenant content calendar' }}</h1>
          <p>Review scheduled content, generated assets, and publishing history in one place.</p>
        </div>
        <div class="heading-actions">
          <span class="admin-badge">SUPER ADMIN ONLY</span>
          <button class="btn" type="button" (click)="goBack()">Close</button>
        </div>
      </div>

      <section class="tenant-strip">
        <div class="tenant-avatar">
          @if (user()?.profile?.profileImage) {
            <img [src]="user()?.profile?.profileImage || ''" [alt]="user()?.name || 'Tenant profile'" />
          } @else {
            {{ initials() }}
          }
        </div>
        <div class="tenant-identity">
          <strong>{{ user()?.name || 'Loading tenant' }}</strong>
          <span>{{ user()?.email || 'Tenant profile' }}</span>
        </div>
        <div class="tenant-facts">
          <span><b>{{ entries().length }}</b> planned</span>
          <span><b>{{ calendar()?.durationDays || 0 }}</b> days</span>
          <span><b>{{ user()?.isActive ? 'Active' : 'Suspended' }}</b> account</span>
        </div>
      </section>

      <div class="calendar-layout">
        <section class="calendar-panel">
          <div class="section-heading">
            <div>
              <span class="section-kicker">PUBLISHING PLAN</span>
              <h2>{{ monthLabel() }}</h2>
            </div>
            <!-- <div class="calendar-controls">
              <button class="icon-button" type="button" aria-label="Previous month">‹</button>
              <button class="today-button" type="button">Today</button>
              <button class="icon-button" type="button" aria-label="Next month">›</button>
            </div> -->
          </div>

          <div class="weekdays">
            @for (day of weekdays; track day) { <span>{{ day }}</span> }
          </div>
          @if (loading()) {
            <div class="calendar-state">Loading marketing calendar…</div>
          } @else if (error()) {
            <div class="calendar-state calendar-error">{{ error() }}</div>
          } @else {
          <div class="calendar-grid">
            @for (day of calendarDays(); track day.iso) {
              <button class="calendar-day" [class.muted-day]="!day.isCurrentMonth" [class.today]="day.isToday" [class.has-activity]="hasDayData(day.iso)" type="button">
                <span class="day-number">{{ day.date }}</span>
                @if (eventsFor(day.iso); as events) {
                  @for (item of events; track item.day) {
                    <span class="day-event" [style.--event-accent]="eventAccent(item.activity)" [attr.title]="item.description">
                      <b>{{ item.activity.replace('_', ' ') }}</b>
                      <strong>{{ item.title }}</strong>
                      <small>{{ item.time }} · {{ item.platform.replace('_', ' ') }}</small>
                    </span>
                  }
                }
                @if (hasDayData(day.iso)) {
                  <span class="day-dossier">
                    <span class="dossier-header"><b>{{ shortDate(day.iso) }}</b><i>DAY BRIEF</i></span>
                    <span class="dossier-orbit"></span>
                    @for (item of eventsFor(day.iso); track item.day) {
                      <span class="dossier-row">
                        <i class="dossier-dot" [style.--event-accent]="eventAccent(item.activity)"></i>
                        <span><b>{{ item.time }} · {{ item.platform.replace('_', ' ') }}</b><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
                      </span>
                    }
                    @for (item of generatedFor(day.iso); track item.id) {
                      <span class="dossier-row generated-row">
                        <i class="dossier-dot" [style.--event-accent]="eventAccent(item.activityType)"></i>
                        <span><b>GENERATED · {{ item.contentType }}</b><strong>{{ contentTitle(item) }}</strong><small>{{ displayStatus(item) }} · {{ item.productName || 'Marketing asset' }}</small></span>
                      </span>
                    }
                    <span class="dossier-footer">Hover to inspect · {{ dayDataCount(day.iso) }} records</span>
                  </span>
                }
              </button>
            }
          </div>
          }
          <!-- <div class="calendar-legend">
            <span><i class="legend-dot scheduled"></i> Scheduled</span>
            <span><i class="legend-dot published"></i> Published</span>
            <span><i class="legend-dot draft"></i> Draft</span>
          </div> -->
        </section>

        <aside class="content-panel">
          <div class="section-heading compact-heading">
            <div>
              <span class="section-kicker">GENERATED CONTENT</span>
              <h2>Content library</h2>
            </div>
            <span class="content-count">{{ generatedContent().length }} assets</span>
          </div>
          @if (contentLoading()) {
            <div class="content-state">Loading generated assets…</div>
          } @else if (contentError()) {
            <div class="content-state content-error">{{ contentError() }}</div>
          } @else {
          <div class="content-list">
            @for (item of generatedContent(); track item.id) {
              <article class="content-card" [class.content-video]="isVideo(item)" (click)="openContent(item)">
                <div class="content-thumb" [style.--thumb-accent]="eventAccent(item.activityType)">
                  @if (isVideo(item) && item.mediaUrl) {
                    <video [src]="item.mediaUrl" muted preload="metadata"></video>
                  } @else {
                    <img [src]="contentPreview(item)" [alt]="contentTitle(item)" />
                  }
                  <span class="media-type">{{ item.contentType || item.activityType }}</span>
                  <button class="preview-button" type="button" aria-label="Preview content" (click)="$event.stopPropagation(); openContent(item)">↗</button>
                </div>
                <div class="content-details">
                  <div class="content-meta"><span>{{ contentDate(item) }} · {{ contentTime(item) }}</span><span class="status-pill" [class]="statusClass(item)">{{ displayStatus(item) }}</span></div>
                  <h3>{{ contentTitle(item) }}</h3>
                  <p>{{ item.platform.replace('_', ' ') }} · {{ item.productName || 'Marketing asset' }}</p>
                </div>
              </article>
            }
          </div>
          }
        </aside>
      </div>

      @if (selectedContent(); as item) {
        <div class="preview-overlay" role="presentation" (click)="closeContent()">
          <section class="preview-modal" role="dialog" aria-modal="true" [attr.aria-label]="contentTitle(item)" (click)="$event.stopPropagation()">
            <button class="modal-close" type="button" aria-label="Close preview" (click)="closeContent()">×</button>
            <div class="preview-media" [style.--preview-accent]="eventAccent(item.activityType)">
              @if (isVideo(item) && item.mediaUrl) {
                <video [src]="item.mediaUrl" controls autoplay></video>
              } @else {
                <img [src]="contentPreview(item)" [alt]="contentTitle(item)" />
              }
            </div>
            <div class="preview-copy">
              <div class="content-meta"><span>{{ item.platform.replace('_', ' ') }} · {{ item.contentType }}</span><span class="status-pill" [class]="statusClass(item)">{{ displayStatus(item) }}</span></div>
              <h2>{{ payload(item).headline || contentTitle(item) }}</h2>
              <p class="preview-description">{{ payload(item).description || 'Generated marketing content for this scheduled activity.' }}</p>
              @if (payload(item).caption) { <div class="detail-block"><b>Caption</b><p>{{ payload(item).caption }}</p></div> }
              @if (payload(item).callToAction) { <div class="detail-block"><b>Call to action</b><p>{{ payload(item).callToAction }}</p></div> }
              @if (payload(item).selectedProduct?.productName) { <div class="product-chip">Product · {{ payload(item).selectedProduct?.productName }}</div> }
              @if (payload(item).hashtags?.length) { <div class="hashtag-row">@for (tag of payload(item).hashtags; track tag) { <span>{{ tag }}</span> }</div> }
            </div>
          </section>
        </div>
      }
    </main>
  `,
  styles: [`
    :host { display:block; }
    .calendar-page { max-width: 1440px; margin: 0 auto; padding: 8px 0 36px; }
    .calendar-heading { display:flex; justify-content:space-between; gap:24px; align-items:flex-end; margin-bottom:24px; }
    .back-link { display:block; border:0; background:none; color:var(--color-text-muted); padding:0; margin-bottom:20px; cursor:pointer; font:inherit; font-size:12px; }
    .back-link:hover { color:var(--color-primary); }
    .eyebrow, .section-kicker { color:var(--color-primary); font-size:10px; font-weight:700; letter-spacing:.13em; }
    h1, h2, h3, p { margin:0; }
    h1 { font-family:'Archivo', sans-serif; font-size:30px; letter-spacing:-.02em; margin:6px 0 7px; }
    .calendar-heading p { color:var(--color-text-muted); font-size:13px; }
    .heading-actions { display:flex; align-items:center; gap:12px; }
    .admin-badge { border:1px solid rgba(224,160,48,.35); background:rgba(224,160,48,.1); color:var(--color-warning); border-radius:5px; padding:6px 9px; font-size:10px; font-weight:700; letter-spacing:.08em; }
    .tenant-strip { display:flex; align-items:center; gap:13px; background:linear-gradient(105deg, var(--color-surface-secondary), var(--color-surface)); border:1px solid var(--color-border); border-radius:10px; padding:14px 17px; margin-bottom:18px; }
    .tenant-avatar { width:42px; height:42px; display:grid; place-items:center; overflow:hidden; border-radius:10px; background:var(--color-primary-fade); border:1px solid var(--color-primary); color:var(--color-primary); font-weight:700; }
    .tenant-avatar img { width:100%; height:100%; object-fit:cover; }
    .tenant-identity { display:flex; flex-direction:column; gap:3px; min-width:190px; }
    .tenant-identity span { color:var(--color-text-dim); font-size:11px; }
    .content-details p { color:var(--color-text-dim); font-size:11px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .tenant-facts { display:flex; gap:24px; margin-left:auto; color:var(--color-text-muted); font-size:11px; }
    .tenant-facts b { color:var(--color-text); font-family:'IBM Plex Mono', monospace; font-size:13px; margin-right:4px; }
    .calendar-layout { display:grid; grid-template-columns:minmax(0, 1.55fr) minmax(310px, .85fr); gap:18px; align-items:start; }
    .calendar-panel, .content-panel { background:var(--color-surface); border:1px solid var(--color-border); border-radius:10px; padding:20px; }
    .section-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:20px; }
    .section-heading h2 { font-size:18px; margin-top:5px; }
    .calendar-controls { display:flex; gap:6px; align-items:center; }
    .icon-button, .today-button, .filter-button { color:var(--color-text-muted); background:var(--color-surface-secondary); border:1px solid var(--color-border-strong); border-radius:6px; cursor:pointer; font:inherit; }
    .icon-button { width:29px; height:29px; font-size:19px; line-height:1; }
    .today-button, .filter-button { padding:6px 10px; font-size:11px; }
    .icon-button:hover, .today-button:hover, .filter-button:hover { color:var(--color-text); border-color:var(--color-primary); }
    .weekdays, .calendar-grid { display:grid; grid-template-columns:repeat(7, minmax(0, 1fr)); }
    .weekdays span { color:var(--color-text-dim); font-size:10px; font-weight:700; letter-spacing:.08em; padding:0 8px 9px; text-transform:uppercase; }
    .calendar-day { position:relative; min-height:116px; text-align:left; border:1px solid var(--color-border); border-right:0; border-bottom:0; background:var(--color-surface-secondary); color:var(--color-text); padding:9px 8px; cursor:pointer; font:inherit; transform-origin:center; transition:transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease; }
    .calendar-day:nth-child(7n) { border-right:1px solid var(--color-border); }
    .calendar-day:nth-last-child(-n+7) { border-bottom:1px solid var(--color-border); }
    .calendar-day:hover { z-index:2; background:var(--color-surface-tertiary); border-color:var(--color-primary); box-shadow:0 8px 20px rgba(0,0,0,.18); transform:translateY(-3px) scale(1.015); }
    .calendar-day.has-activity::after { content:""; position:absolute; right:8px; top:11px; width:5px; height:5px; border-radius:50%; background:var(--color-primary); box-shadow:0 0 0 4px var(--color-primary-fade); animation:date-beacon 2.4s ease-in-out infinite; }
    .day-number { display:grid; place-items:center; width:23px; height:23px; border-radius:50%; font-size:12px; margin-bottom:7px; }
    .calendar-day.today .day-number { background:var(--color-primary); color:var(--color-primary-contrast); font-weight:700; }
    .muted-day { opacity:.38; }
    .day-event { display:flex; flex-direction:column; gap:2px; overflow:hidden; color:var(--color-text-muted); border-left:3px solid var(--event-accent, var(--color-primary)); border-radius:3px; background:var(--color-surface-tertiary); padding:5px 5px 5px 6px; font-size:9px; line-height:1.25; text-align:left; transition:color .18s ease, transform .18s ease, background .18s ease; }
    .calendar-day:hover .day-event { color:var(--color-text); transform:translateX(2px); }
    .calendar-day:hover .day-event { background:var(--color-surface); }
    .day-event b { color:var(--event-accent, var(--color-primary)); font-size:8px; letter-spacing:.06em; text-transform:uppercase; }
    .day-event strong { overflow:hidden; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
    .day-event small { color:var(--color-text-dim); font-size:9px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .day-dossier { position:absolute; z-index:20; left:calc(100% - 8px); top:12px; display:flex; flex-direction:column; gap:9px; width:270px; padding:13px; border:1px solid rgba(224,160,48,.62); border-radius:10px; background:linear-gradient(135deg, #fff7e6 0%, #e5f3ef 52%, #e4edf7 100%); box-shadow:0 18px 38px rgba(39,74,79,.2), 0 0 0 1px rgba(255,255,255,.65); color:#20383b; opacity:0; pointer-events:none; transform:translateX(-12px) scale(.94) rotateY(-8deg); transform-origin:left center; transition:opacity .22s ease, transform .3s cubic-bezier(.2,.8,.2,1); }
    .calendar-day:nth-child(7n) .day-dossier, .calendar-day:nth-child(7n-1) .day-dossier { left:auto; right:calc(100% - 8px); transform-origin:right center; transform:translateX(12px) scale(.94) rotateY(8deg); }
    .calendar-day:hover .day-dossier, .calendar-day:focus-visible .day-dossier { opacity:1; pointer-events:auto; transform:translateX(0) scale(1) rotateY(0); }
    .dossier-header { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(32,56,59,.14); padding-bottom:9px; }
    .dossier-header b { color:#b36d16; font-family:'JetBrains Mono',monospace; font-size:12px; }
    .dossier-header i { color:#5c7474; font-size:8px; font-style:normal; font-weight:800; letter-spacing:.13em; }
    .dossier-orbit { position:absolute; z-index:-1; top:calc(100% - 7px); right:18px; width:24px; height:24px; border:1px solid rgba(179,109,22,.42); border-radius:50%; background:rgba(255,247,230,.6); box-shadow:0 0 0 5px rgba(179,109,22,.07), 0 5px 14px rgba(179,109,22,.2); animation:orbit-drift 7s ease-in-out infinite; }
    .dossier-row { display:flex; gap:8px; align-items:flex-start; animation:dossier-row-in .35s both; }
    .dossier-row:nth-of-type(3) { animation-delay:.06s; }
    .dossier-row:nth-of-type(4) { animation-delay:.12s; }
    .dossier-dot { flex:none; width:7px; height:7px; margin-top:4px; border-radius:50%; background:var(--event-accent,var(--color-primary)); box-shadow:0 0 9px var(--event-accent,var(--color-primary)); }
    .dossier-row span { display:flex; flex-direction:column; gap:2px; min-width:0; }
    .dossier-row b { color:var(--event-accent,var(--color-primary)); font-size:8px; letter-spacing:.04em; text-transform:uppercase; }
    .dossier-row strong { overflow:hidden; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }
    .dossier-row small { display:-webkit-box; overflow:hidden; color:#5c7474; font-size:9px; line-height:1.3; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
    .dossier-footer { border-top:1px solid rgba(32,56,59,.14); padding-top:8px; color:#5c7474; font-size:9px; text-align:right; }
    .generated-row { background:rgba(255,255,255,.5); border-radius:5px; padding:5px; }
    .legend-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--event-accent, var(--color-primary)); margin-right:4px; }
    .calendar-legend { display:flex; gap:16px; color:var(--color-text-dim); font-size:10px; margin-top:14px; }
    .calendar-state { min-height:360px; display:grid; place-items:center; color:var(--color-text-muted); font-size:13px; border:1px dashed var(--color-border); border-radius:8px; }
    .calendar-error { color:var(--color-danger); }
    .legend-dot { background:var(--color-primary); margin:0 5px 0 0; }
    .legend-dot.published { background:var(--color-success); }
    .legend-dot.draft { background:var(--color-violet); }
    .content-panel { padding-bottom:14px; }
    .compact-heading { margin-bottom:15px; }
    .content-count { color:var(--color-text-dim); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
    .content-state { min-height:180px; display:grid; place-items:center; color:var(--color-text-muted); font-size:12px; border:1px dashed var(--color-border); border-radius:8px; padding:20px; text-align:center; }
    .content-error { color:var(--color-danger); }
    .content-list { display:flex; flex-direction:column; gap:10px; }
    .content-card { display:flex; gap:11px; padding:9px; border:1px solid var(--color-border); border-radius:8px; background:var(--color-surface-secondary); }
    .content-thumb { position:relative; flex:none; width:88px; height:76px; overflow:hidden; border-radius:6px; background:linear-gradient(135deg, var(--thumb-accent), var(--color-surface-tertiary)); }
    .content-thumb img, .content-thumb video { width:100%; height:100%; object-fit:cover; opacity:.84; }
    .media-type { position:absolute; left:6px; bottom:5px; color:white; background:rgba(0,0,0,.65); border-radius:3px; padding:3px 5px; font-size:9px; font-weight:700; text-transform:uppercase; }
    .preview-button { position:absolute; right:5px; top:5px; width:22px; height:22px; border:0; border-radius:50%; background:rgba(0,0,0,.58); color:white; cursor:pointer; }
    .content-details { min-width:0; padding:2px 0; }
    .content-meta { display:flex; justify-content:space-between; gap:5px; color:var(--color-text-dim); font-size:10px; }
    .status-pill { display:inline-flex; align-items:center; border-radius:5px; padding:3px 7px; font-size:10px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; }
    .status-in-progress { color:#f1c75b; background:rgba(224,160,48,.16); border:1px solid rgba(224,160,48,.42); }
    .status-pending { color:#f08b78; background:rgba(229,100,78,.14); border:1px solid rgba(229,100,78,.38); }
    .status-done { color:#65d49e; background:rgba(63,178,127,.15); border:1px solid rgba(63,178,127,.38); }
    .status-default { color:var(--color-text-muted); background:var(--color-surface-tertiary); border:1px solid var(--color-border-strong); }
    .content-details h3 { font-size:12px; line-height:1.35; margin:8px 0 5px; }
    .content-card { cursor:pointer; transition:transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
    .content-card:hover { transform:translateY(-3px); border-color:var(--color-primary); box-shadow:0 12px 24px rgba(0,0,0,.18); }
    .content-card:hover .content-thumb img, .content-card:hover .content-thumb video { transform:scale(1.06); opacity:1; }
    .content-thumb img, .content-thumb video { transition:transform .35s ease, opacity .2s ease; }
    .preview-overlay { position:fixed; inset:0; z-index:150; display:grid; place-items:center; padding:22px; background:rgba(3,5,8,.78); animation:preview-fade .2s ease both; }
    .preview-modal { position:relative; display:grid; grid-template-columns:minmax(280px, .95fr) minmax(300px, 1.05fr); width:min(900px, 100%); max-height:90vh; overflow:auto; background:var(--color-surface); border:1px solid var(--color-border-strong); border-radius:12px; box-shadow:0 28px 90px rgba(0,0,0,.5); animation:preview-rise .28s cubic-bezier(.2,.8,.2,1) both; }
    .modal-close { position:absolute; z-index:2; right:12px; top:12px; width:30px; height:30px; border:1px solid rgba(255,255,255,.2); border-radius:50%; background:rgba(0,0,0,.5); color:white; cursor:pointer; font-size:21px; line-height:1; }
    .preview-media { min-height:360px; display:grid; place-items:center; overflow:hidden; background:linear-gradient(145deg, var(--preview-accent), var(--color-surface-tertiary)); }
    .preview-media img, .preview-media video { width:100%; height:100%; max-height:560px; object-fit:contain; }
    .preview-copy { padding:28px 25px; }
    .preview-copy h2 { font-size:21px; line-height:1.25; margin:12px 0 12px; }
    .preview-description { color:var(--color-text-muted); font-size:12px; line-height:1.6; }
    .detail-block { border-top:1px solid var(--color-border); margin-top:17px; padding-top:13px; }
    .detail-block b { color:var(--color-text-dim); font-size:10px; letter-spacing:.08em; text-transform:uppercase; }
    .detail-block p { color:var(--color-text-muted); font-size:12px; line-height:1.55; margin-top:6px; }
    .product-chip { display:inline-block; margin-top:17px; padding:6px 9px; border:1px solid rgba(224,160,48,.35); border-radius:5px; color:var(--color-warning); background:rgba(224,160,48,.1); font-size:11px; }
    .hashtag-row { display:flex; flex-wrap:wrap; gap:5px; margin-top:18px; }
    .hashtag-row span { color:var(--color-info); background:rgba(90,155,216,.1); border-radius:4px; padding:4px 6px; font-size:10px; }
    @keyframes preview-fade { from { opacity:0; } to { opacity:1; } }
    @keyframes preview-rise { from { opacity:0; transform:translateY(18px) scale(.97); } to { opacity:1; transform:none; } }
    @media (max-width: 900px) { .calendar-layout { grid-template-columns:1fr; } }
    @keyframes date-beacon { 0%,100% { opacity:.65; transform:scale(.9); } 50% { opacity:1; transform:scale(1.25); } }
    @keyframes orbit-drift { 0%,100% { transform:translate(0,0) rotate(0deg) scale(.9); } 24% { transform:translate(-9px,5px) rotate(70deg) scale(1.05); } 52% { transform:translate(5px,10px) rotate(155deg) scale(.82); } 77% { transform:translate(12px,3px) rotate(245deg) scale(1.12); } }
    @keyframes dossier-row-in { from { opacity:0; transform:translateX(-5px); } to { opacity:1; transform:none; } }
    @media (max-width: 900px) { .day-dossier { left:0; top:calc(100% + 8px); transform:translateY(-8px) scale(.94); transform-origin:top left; } .calendar-day:nth-child(7n) .day-dossier, .calendar-day:nth-child(7n-1) .day-dossier { left:0; right:auto; transform:translateY(-8px) scale(.94); transform-origin:top left; } .calendar-day:hover .day-dossier, .calendar-day:focus-visible .day-dossier { transform:translateY(0) scale(1); } }
    @media (max-width: 620px) { .calendar-heading, .tenant-strip { align-items:flex-start; flex-direction:column; } .heading-actions, .tenant-facts { margin-left:0; } .tenant-facts { flex-wrap:wrap; gap:10px 18px; } .calendar-panel, .content-panel { padding:14px; } .calendar-day { min-height:88px; padding:6px 5px; } .day-event { font-size:9px; } .weekdays span { padding-left:4px; } .day-dossier { width:235px; } .preview-modal { grid-template-columns:1fr; } .preview-media { min-height:230px; max-height:300px; } .preview-copy { padding:22px 18px; } }
  `],
})
export class TenantCalendarComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly tenantsService = inject(TenantsService);
  private readonly calendarService = inject(MarketingCalendarService);
  private readonly generatedContentService = inject(GeneratedContentService);
  readonly user = signal<DigitalUser | null>(null);
  readonly calendar = signal<MarketingCalendar | null>(null);
  readonly generatedContent = signal<GeneratedContentItem[]>([]);
  readonly selectedContent = signal<GeneratedContentItem | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly contentLoading = signal(true);
  readonly contentError = signal<string | null>(null);

  readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly entries = computed(() => this.calendar()?.calendar ?? []);
  readonly monthLabel = computed(() => {
    const date = this.calendar()?.startDate ? new Date(`${this.calendar()!.startDate}T00:00:00`) : new Date();
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const startDate = this.calendar()?.startDate;
    const baseDate = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const days: CalendarDay[] = [];
    for (let index = 0; index < 42; index++) {
      const dayNumber = index - firstDay + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const date = isCurrentMonth ? dayNumber : dayNumber <= 0 ? previousMonthDays + dayNumber : dayNumber - daysInMonth;
      const dateMonth = isCurrentMonth ? month : dayNumber <= 0 ? month - 1 : month + 1;
      const dateYear = dateMonth < 0 ? year - 1 : dateMonth > 11 ? year + 1 : year;
      const normalizedMonth = (dateMonth + 12) % 12;
      const iso = `${dateYear}-${String(normalizedMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      days.push({ date, iso, isToday: iso === new Date().toISOString().slice(0, 10), isCurrentMonth });
    }
    return days;
  });

  constructor() {
    const userId = this.storage.get('marketos.calendar.userId') || this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.tenantsService.list().subscribe((summary) => this.user.set(summary.find((item) => item.userId === userId) ?? null));
      this.calendarService.getByUser(userId).subscribe({
        next: (calendar) => {
          this.calendar.set(calendar);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Marketing calendar could not be loaded. Please try again later.');
          this.loading.set(false);
        },
      });
      this.generatedContentService.getByUser(userId).subscribe({
        next: (content) => {
          this.generatedContent.set(content);
          this.contentLoading.set(false);
        },
        error: () => {
          this.contentError.set('Generated content could not be loaded. Please try again later.');
          this.contentLoading.set(false);
        },
      });
    } else {
      this.error.set('No tenant was selected for this calendar.');
      this.loading.set(false);
      this.contentError.set('No tenant was selected for generated content.');
      this.contentLoading.set(false);
    }
  }

  readonly initials = computed(() => (this.user()?.name || 'TU').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase());

  eventsFor(iso: string): MarketingCalendarEntry[] {
    return this.entries().filter((item) => item.date.slice(0, 10) === iso);
  }

  generatedFor(iso: string): GeneratedContentItem[] {
    return this.generatedContent().filter((item) => item.aiResponse?.activity?.date?.slice(0, 10) === iso);
  }

  hasDayData(iso: string): boolean {
    return this.eventsFor(iso).length > 0 || this.generatedFor(iso).length > 0;
  }

  dayDataCount(iso: string): number {
    return this.eventsFor(iso).length + this.generatedFor(iso).length;
  }

  shortDate(iso: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${iso}T00:00:00`));
  }

  eventAccent(activity: string): string {
    const accents: Record<string, string> = {
      IMAGE: '#e0a030', REEL: '#9b7bd4', VIDEO: '#5a9bd8', ADVERTISEMENT: '#e5644e',
      BLOG: '#3fb27f', CUSTOMER_ENGAGEMENT: '#55b8b3', LEAD_GENERATION: '#d77a9b',
    };
    return accents[activity] || 'var(--color-primary)';
  }

  contentPreview(item: GeneratedContentItem): string {
    if (item.mediaUrl && !this.isVideo(item)) return item.mediaUrl;
    const label = encodeURIComponent(item.activityType.replace('_', ' '));
    return `https://placehold.co/400x260/202b32/f6f1e5?text=${label}`;
  }

  isVideo(item: GeneratedContentItem): boolean {
    return item.mediaType?.toLowerCase().includes('video') || item.contentType.toLowerCase() === 'video' || item.activityType === 'REEL';
  }

  contentTitle(item: GeneratedContentItem): string {
    return this.payload(item).headline || item.aiResponse?.activity?.title || item.activityType.replace('_', ' ');
  }

  contentDate(item: GeneratedContentItem): string {
    const date = item.aiResponse?.activity?.date;
    return date ? this.formatDate(date) : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(item.createdAt));
  }

  contentTime(item: GeneratedContentItem): string {
    return item.aiResponse?.activity?.time || 'Generated';
  }

  displayStatus(item: GeneratedContentItem): string {
    return (item.editorStatus || item.status || 'UNKNOWN').replace(/_/g, ' ');
  }

  statusClass(item: GeneratedContentItem): string {
    const status = (item.editorStatus || item.status || '').toUpperCase();
    if (status === 'IN_PROGRESS') return 'status-in-progress';
    if (status === 'PENDING' || status === 'IN_QUEUE' || status === 'QUEUED') return 'status-pending';
    if (status === 'DONE' || status === 'COMPLETED' || status === 'PUBLISHED') return 'status-done';
    return 'status-default';
  }

  payload(item: GeneratedContentItem): GeneratedContentPayload {
    if (item.generatedContent) {
      try {
        const parsed = JSON.parse(item.generatedContent) as GeneratedContentPayload;
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        // Image records use generatedContent for the media URL.
      }
    }

    return item.aiResponse?.marketingContent || item.aiResponse?.response || {};
  }

  openContent(item: GeneratedContentItem): void {
    this.selectedContent.set(item);
  }

  closeContent(): void {
    this.selectedContent.set(null);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`));
  }

  goBack(): void {
    this.router.navigate(['/admin/tenants']);
  }
}