import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import type { AppLanguage, LanguageOption } from '@erp/contracts';
import { ErpIconComponent } from '../icon/erp-icon';

const DEFAULT_OPTIONS: readonly LanguageOption[] = [
  { id: 'en', flag: '🇬🇧', code: 'EN', display: '🇬🇧 EN' },
  { id: 'ar', flag: '🇸🇦', code: 'AR', display: '🇸🇦 AR' },
];

@Component({
  selector: 'erp-language-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatMenuModule, ErpIconComponent],
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

  protected select(language: AppLanguage): void {
    if (language !== this.language()) {
      this.languageChange.emit(language);
    }
  }
}
