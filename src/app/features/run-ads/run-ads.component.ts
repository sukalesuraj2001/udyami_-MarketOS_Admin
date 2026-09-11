import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DigitalUser } from '../../core/models/domain.model';
import { TenantsService } from '../tenants/tenants.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({ selector: 'app-run-ads-page', standalone: true, imports: [SkeletonComponent, EmptyStateComponent], templateUrl: './run-ads.component.html', styleUrl: './run-ads.component.scss' })
export class RunAdsComponent {
  private readonly tenantsService = inject(TenantsService);
  private readonly router = inject(Router);
  readonly users = signal<DigitalUser[]>([]);
  readonly loading = signal(true);
  readonly query = signal('');
  readonly filteredUsers = computed(() => {
    const query = this.query().trim().toLowerCase();
    return !query ? this.users() : this.users().filter((user) => [user.name, user.email, this.businessName(user), this.location(user)].some((value) => value.toLowerCase().includes(query)));
  });

  constructor() {
    this.tenantsService.list().subscribe({ next: (users) => { this.users.set(users.filter((user) => user.isActive)); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  initials(user: DigitalUser): string { return user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  businessName(user: DigitalUser): string { return user.profile?.businessDetails?.businessName || user.profile?.selectedBusinessVertical || 'Independent business'; }
  location(user: DigitalUser): string { return user.businessLocation || user.officeLocation || user.profile?.cityOfResidence || user.profile?.district || 'Location not set'; }
  plan(user: DigitalUser): string { return user.isPrime ? 'Prime' : user.isPatron ? 'Patron' : user.isBasic ? 'Basic' : user.isTrial ? 'Trial' : 'Digital'; }
  viewAds(user: DigitalUser): void { this.router.navigate(['/admin/run-ads', user.userId]); }
}
