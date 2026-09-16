import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { LanguageService } from './language.service';

/**
 * Ensures language + document direction are restored at application startup
 * (including before authentication / login).
 */
export function provideErpI18n(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      // Constructing LanguageService applies persisted language + dir.
      inject(LanguageService);
    }),
  ]);
}
