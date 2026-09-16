import { Injectable, computed, inject, signal } from '@angular/core';
import type { AppLanguage, DocumentDirection } from '@erp/contracts';
import { NOTIFICATION_HANDLER } from '@erp/core';
import { AR_CATALOG } from './catalogs/ar';
import { EN_CATALOG } from './catalogs/en';

export const LANGUAGE_STORAGE_KEY = 'erp.language';

const CATALOGS: Record<AppLanguage, Readonly<Record<string, string>>> = {
  en: EN_CATALOG,
  ar: AR_CATALOG,
};

function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'en' || value === 'ar';
}

function directionFor(language: AppLanguage): DocumentDirection {
  return language === 'ar' ? 'rtl' : 'ltr';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly notifications = inject(NOTIFICATION_HANDLER, { optional: true });

  private readonly languageSignal = signal<AppLanguage>(this.resolveInitialLanguage());
  private readonly catalogSignal = signal<Readonly<Record<string, string>>>(
    CATALOGS[this.languageSignal()],
  );

  readonly language = this.languageSignal.asReadonly();
  readonly direction = computed<DocumentDirection>(() =>
    directionFor(this.languageSignal()),
  );

  constructor() {
    this.applyDocument(this.languageSignal());
  }

  /** Resolve a message key; missing keys return the key (or explicit fallback). */
  t(key: string, fallback?: string, params?: Record<string, string>): string {
    const catalog = this.catalogSignal();
    let text = catalog[key] ?? fallback ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.split(`{${name}}`).join(value);
      }
    }
    return text;
  }

  setLanguage(language: AppLanguage): void {
    if (!isAppLanguage(language)) {
      return;
    }

    if (language === this.languageSignal()) {
      return;
    }

    const catalog = CATALOGS[language];
    if (!catalog) {
      this.notifyLoadFailure();
      return;
    }

    try {
      this.languageSignal.set(language);
      this.catalogSignal.set(catalog);
      this.persist(language);
      this.applyDocument(language);
    } catch {
      this.notifyLoadFailure();
    }
  }

  /** Test/harness helper — simulates a failed switch without changing state. */
  simulateCatalogLoadFailure(): void {
    this.notifyLoadFailure();
  }

  private resolveInitialLanguage(): AppLanguage {
    if (typeof window === 'undefined') {
      return 'en';
    }

    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isAppLanguage(stored)) {
        return stored;
      }
    } catch {
      // ignore storage access errors
    }

    return 'en';
  }

  private persist(language: AppLanguage): void {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }

  private applyDocument(language: AppLanguage): void {
    if (typeof document === 'undefined') {
      return;
    }
    const dir = directionFor(language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }

  private notifyLoadFailure(): void {
    const summary = this.t(
      'shell.language.loadFailed',
      'Could not switch language. Keeping previous language.',
    );
    if (this.notifications) {
      this.notifications.show({ severity: 'warn', summary });
      return;
    }
    if (typeof console !== 'undefined') {
      console.warn(summary);
    }
  }
}
