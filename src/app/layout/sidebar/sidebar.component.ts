import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  path: string;
  icon: string;
  label: string;
  badgeCount?: number;
  badgeHot?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly groups = input.required<NavGroup[]>();
  readonly open = input<boolean>(false);
  readonly navigated = output<void>();
}
