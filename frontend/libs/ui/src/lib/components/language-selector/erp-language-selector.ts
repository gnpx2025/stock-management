import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { AppLanguage, LanguageOption } from '@erp/contracts';
import { ErpIconComponent } from '../icon/erp-icon';
import { ErpMenuComponent, type ErpMenuItem } from '../menu/erp-menu';

const DEFAULT_OPTIONS: readonly LanguageOption[] = [
  { id: 'en', flag: '🇬🇧', code: 'EN', display: '🇬🇧 EN' },
  { id: 'ar', flag: '🇸🇦', code: 'AR', display: '🇸🇦 AR' },
];

@Component({
  selector: 'erp-language-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErpMenuComponent, ErpIconComponent],
  templateUrl: './erp-language-selector.html',
  styleUrl: './erp-language-selector.scss',
})
export class ErpLanguageSelectorComponent {
  readonly language = input.required<AppLanguage>();
  readonly ariaLabel = input('Language');
  readonly options = input<readonly LanguageOption[]>(DEFAULT_OPTIONS);

  readonly languageChange = output<AppLanguage>();

  readonly activeOption = computed(() => {
    const current = this.language();
    return (
      this.options().find((option) => option.id === current) ??
      this.options()[0]
    );
  });

  protected readonly menuItems = computed<readonly ErpMenuItem[]>(() =>
    this.options().map((option) => ({
      id: option.id,
      label: option.display,
      ariaCurrent: option.id === this.language() ? true : undefined,
    })),
  );

  protected onItemSelected(item: ErpMenuItem): void {
    this.select(item.id as AppLanguage);
  }

  protected select(language: AppLanguage): void {
    if (language !== this.language()) {
      this.languageChange.emit(language);
    }
  }
}
