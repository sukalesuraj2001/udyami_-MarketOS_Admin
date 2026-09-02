import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatureFlagsService } from '../feature-flags.service';
import { FeatureFlag } from '../../../core/models/domain.model';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { NotificationService } from '../../../core/services/notification.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-feature-flags-page',
  standalone: true,
  imports: [FormsModule, ToggleComponent, SkeletonComponent],
  templateUrl: './feature-flags.component.html',
})
export class FeatureFlagsComponent {
  private readonly flagsService = inject(FeatureFlagsService);
  private readonly notifications = inject(NotificationService);

  readonly tenants = ['Sri Lakshmi Industries', 'Nandi Foods', 'Malnad Estates'];
  selectedTenant = this.tenants[0];

  readonly flags = signal<FeatureFlag[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.flagsService.getForTenant(this.selectedTenant).subscribe({
      next: (res) => { this.flags.set(res.flags); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggle(flag: FeatureFlag): void {
    if (flag.locked) {
      this.notifications.error('Locked', 'Both gates must pass before this can be enabled');
      return;
    }
    const nextEnabled = !flag.enabled;
    // Optimistic update — rolled back below if the API call fails.
    this.flags.update((list) => list.map((f) => (f.id === flag.id ? { ...f, enabled: nextEnabled } : f)));

    this.flagsService.setEnabled(flag.id, nextEnabled).subscribe({
      next: () => this.notifications.success(nextEnabled ? 'Enabled' : 'Disabled', `${flag.name} for ${this.selectedTenant}`),
      error: () => {
        this.flags.update((list) => list.map((f) => (f.id === flag.id ? { ...f, enabled: !nextEnabled } : f)));
      },
    });
  }
}
