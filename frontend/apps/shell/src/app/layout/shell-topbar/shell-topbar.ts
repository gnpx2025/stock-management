import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import type { AppLanguage } from '@erp/contracts';
import { AuthSessionService } from '@erp/core';
import { LanguageService, TranslatePipe } from '@erp/i18n';
import {
  ErpButtonComponent,
  ErpIconComponent,
  ErpLanguageSelectorComponent,
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
    ErpLanguageSelectorComponent,
    TranslatePipe,
  ],
  templateUrl: './shell-topbar.html',
  styleUrl: './shell-topbar.scss',
})
export class ShellTopbarComponent {
  private readonly auth = inject(AuthSessionService);
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);

  readonly navOpen = input(false);
  readonly navToggle = output<void>();

  protected readonly searchOptions = computed<readonly ErpSearchOption[]>(() => {
    this.language.language();
    return [
      {
        value: 'dashboard',
        label: this.language.t('shell.search.dashboard', 'Dashboard'),
      },
      {
        value: 'customers',
        label: this.language.t('shell.search.customers', 'Customers'),
      },
      {
        value: 'sales-invoice',
        label: this.language.t('shell.search.salesInvoice', 'Sales Invoice'),
      },
      {
        value: 'stock-summary',
        label: this.language.t('shell.search.stockSummary', 'Stock Summary'),
      },
      {
        value: 'journal-entry',
        label: this.language.t('shell.search.journalEntry', 'Journal Entry'),
      },
    ];
  });

  protected readonly displayName = computed(() => {
    this.language.language();
    const name = this.auth.user()?.userName?.trim();
    return name && name.length > 0
      ? name
      : this.language.t('shell.topbar.userFallback', 'User');
  });

  protected readonly themeToggleIcon = computed(() =>
    this.theme.currentMode() === 'dark' ? 'light_mode' : 'dark_mode',
  );

  protected readonly themeToggleLabel = computed(() => {
    this.language.language();
    return this.theme.currentMode() === 'dark'
      ? this.language.t('shell.topbar.themeToLight', 'Switch to light theme')
      : this.language.t('shell.topbar.themeToDark', 'Switch to dark theme');
  });

  protected readonly languageAriaLabel = computed(() => {
    this.language.language();
    return this.language.t('shell.language.label', 'Language');
  });

  protected readonly accountMenuLabel = computed(() => {
    this.language.language();
    return this.language.t('shell.topbar.accountMenu', 'Account menu for {name}', {
      name: this.displayName(),
    });
  });

  protected readonly navToggleLabel = computed(() => {
    this.language.language();
    return this.navOpen()
      ? this.language.t('shell.sidebar.closeNav', 'Close navigation')
      : this.language.t('shell.sidebar.openNav', 'Open navigation');
  });

  protected onNotificationClick(): void {
    // UI placeholder — no panel, toast, or API in this feature.
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected onLanguageChange(language: AppLanguage): void {
    this.language.setLanguage(language);
  }

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}
