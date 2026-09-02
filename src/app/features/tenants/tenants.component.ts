import { Component, inject, signal } from '@angular/core';

import { TenantsService } from './tenants.service';

import { DigitalUser } from '../../core/models/domain.model';

import { TenantToolbarComponent } from './components/tenant-toolbar.component';

import { TenantTableComponent } from './components/tenant-table.component';

import { ProvisionTenantDialogComponent } from './components/provision-tenant-dialog.component';

import { ImpersonateDialogComponent } from './components/impersonate-dialog.component';

import { SuspendTenantDialogComponent } from './components/suspend-tenant-dialog.component';

import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';


/**
 * Dialog state
 */
type DialogState =
  | { kind: 'none' }
  | { kind: 'provision' }
  | { kind: 'impersonate'; tenant: DigitalUser }
  | { kind: 'suspend'; tenant: DigitalUser };


@Component({
  selector: 'app-tenants-page',
  standalone: true,
  imports: [
    TenantToolbarComponent,
    TenantTableComponent,
    ProvisionTenantDialogComponent,
    ImpersonateDialogComponent,
    SuspendTenantDialogComponent,
    SkeletonComponent,
  ],
  templateUrl: './tenants.component.html',
})
export class TenantsComponent {

  /**
   * Tenants service
   */
  private readonly tenantsService = inject(TenantsService);


  /**
   * All digital users received from API
   */
  readonly allTenants = signal<DigitalUser[]>([]);


  /**
   * Loading state
   */
  readonly loading = signal<boolean>(true);


  /**
   * Dialog state
   */
  readonly dialog = signal<DialogState>({
    kind: 'none',
  });


  /**
   * Load users when component is initialized
   */
  constructor() {
    this.load();
  }


  /**
   * Load digital users from API
   */
  load(): void {

    this.loading.set(true);

    this.tenantsService.list().subscribe({

      next: (users: DigitalUser[]) => {

        console.log('Digital users:', users);

        this.allTenants.set(users);

        this.loading.set(false);
      },


      error: (error) => {

        console.error(
          'Failed to load digital users:',
          error
        );

        this.allTenants.set([]);

        this.loading.set(false);
      },

    });
  }


  /**
   * Called after dialog action is completed
   */
  onDialogSettled(): void {

    this.dialog.set({
      kind: 'none',
    });

    this.load();
  }

}