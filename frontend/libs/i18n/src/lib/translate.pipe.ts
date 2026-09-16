import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({
  name: 'erpTranslate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(
    key: string,
    fallback?: string,
    params?: Record<string, string>,
  ): string {
    // Touch language signal so impure pipe refreshes on locale change.
    this.language.language();
    return this.language.t(key, fallback, params);
  }
}
