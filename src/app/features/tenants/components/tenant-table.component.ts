import { Component, input, output } from '@angular/core';
import { DigitalUser, Tenant } from '../../../core/models/domain.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-tenant-table',
  standalone: true,
  imports: [StatusTagComponent, EmptyStateComponent],
  templateUrl: './tenant-table.component.html',
})
export class TenantTableComponent {
  readonly tenants = input.required<DigitalUser[]>();

  readonly impersonate = output<DigitalUser>();

  readonly suspendRequested = output<DigitalUser>();

  statusLabel(user: DigitalUser): string {
    return user.isActive ? 'Active' : 'Suspended';
  }

  statusVariant(user: DigitalUser): 'ok' | 'danger' {
    return user.isActive ? 'ok' : 'danger';
  }

  getPlan(user: DigitalUser): string {
    if (user.isPrime) return 'Prime';
    if (user.isPatron) return 'Patron';
    if (user.isBasic) return 'Basic';
    if (user.isTrial) return 'Trial';
    if (user.isDigital) return 'Paid';

    return 'Fress';
  }

  getBusiness(user: DigitalUser): string {
    return user.profile?.businessDetails?.businessName
      || user.profile?.selectedBusinessVertical
      || (user.hasBusiness ? 'Business' : '—');
  }

  getLocation(user: DigitalUser): string {
    return (
      user.businessLocation ||
      user.officeLocation ||
      user.profile?.cityOfResidence ||
      user.profile?.district ||
      '—'
    );
  }
}
