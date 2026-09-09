import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { AuthSessionService, LoadingService } from '@erp/core';
import { ThemeService } from '@erp/ui';
import { GlobalLoaderComponent } from './global-loader';

@Component({
  selector: 'app-shell-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Button,
    Toast,
    GlobalLoaderComponent,
  ],
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
})
export class ShellLayoutComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly loading = inject(LoadingService);
  private readonly auth = inject(AuthSessionService);

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
