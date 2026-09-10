import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ShellSidebarNavComponent } from '../shell-sidebar-nav/shell-sidebar-nav';

@Component({
  selector: 'app-shell-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShellSidebarNavComponent],
  templateUrl: './shell-sidebar.html',
  styleUrl: './shell-sidebar.scss',
})
export class ShellSidebarComponent {}
