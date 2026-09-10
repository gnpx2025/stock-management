import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthSessionService } from '@erp/core';
import {
  ErpButtonComponent,
  ErpIconComponent,
  ErpSearchInputComponent,
  ThemeService,
  type ErpSearchOption,
} from '@erp/ui';

@Component({
  selector: 'app-shell-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatMenuModule,
    ErpButtonComponent,
    ErpIconComponent,
    ErpSearchInputComponent,
  ],
  templateUrl: './shell-topbar.html',
  styleUrl: './shell-topbar.scss',
})
export class ShellTopbarComponent {
  private readonly auth = inject(AuthSessionService);
  protected readonly theme = inject(ThemeService);

  /** Static UI stubs only — no search API / navigation in this feature. */
  protected readonly searchOptions: readonly ErpSearchOption[] = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'customers', label: 'Customers' },
    { value: 'sales-invoice', label: 'Sales Invoice' },
    { value: 'stock-summary', label: 'Stock Summary' },
    { value: 'journal-entry', label: 'Journal Entry' },
  ];

  protected readonly displayName = computed(() => {
    const name = this.auth.user()?.userName?.trim();
    return name && name.length > 0 ? name : 'User';
  });

  protected readonly themeToggleIcon = computed(() =>
    this.theme.currentMode() === 'dark' ? 'light_mode' : 'dark_mode',
  );

  protected readonly themeToggleLabel = computed(() =>
    this.theme.currentMode() === 'dark'
      ? 'Switch to light theme'
      : 'Switch to dark theme',
  );

  protected onNotificationClick(): void {
    // UI placeholder — no panel, toast, or API in this feature.
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}
