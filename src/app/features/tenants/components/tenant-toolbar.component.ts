import { Component, output } from '@angular/core';

@Component({
  selector: 'app-tenant-toolbar',
  standalone: true,
  template: `
    <div class="phead">
      <div><h1>Tenants</h1><p>Health is scored on approval turnaround, publish success, and whether their qualified rate is moving.</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-gold" type="button" (click)="provisionClicked.emit()">+ Provision tenant</button>
      </div>
    </div>
  `,
})
export class TenantToolbarComponent {
  readonly provisionClicked = output<void>();
}
