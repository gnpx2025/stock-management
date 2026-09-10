import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from '../global-loader/global-loader';
import { ShellSidebarComponent } from '../shell-sidebar/shell-sidebar';
import { ShellTopbarComponent } from '../shell-topbar/shell-topbar';

@Component({
  selector: 'app-shell-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    GlobalLoaderComponent,
    ShellSidebarComponent,
    ShellTopbarComponent,
  ],
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
})
export class ShellLayoutComponent {}
