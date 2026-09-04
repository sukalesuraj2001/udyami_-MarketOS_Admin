import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavGroup } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastStackComponent } from '../../shared/components/toast/toast.component';
import { EditorTaskStore } from '../../features/editor/editor-task.store';

@Component({
  selector: 'app-editor-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastStackComponent],
  templateUrl: './editor-layout.component.html',
})
export class EditorLayoutComponent {
  private readonly taskStore = inject(EditorTaskStore);
  readonly mobileNavOpen = signal(false);

  readonly navGroups = computed<NavGroup[]>(() => [
    {
      label: 'Platform',
      items: [
        { path: '/editor/queue', icon: '▤', label: 'My Queue', badgeCount: this.taskStore.myQueueCount() },
        { path: '/editor/pending', icon: '◔', label: 'Pending', badgeCount: this.taskStore.pendingCount() },
      ],
    },
    {
      label: 'Work',
      items: [
        // { path: '/editor/in-progress', icon: '▶', label: 'In Progress' },
        { path: '/editor/history', icon: '✓', label: 'Completed History' },
      ],
    },
  ]);

  toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
