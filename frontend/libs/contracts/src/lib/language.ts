export type AppLanguage = 'en' | 'ar';

export type DocumentDirection = 'ltr' | 'rtl';

export interface LanguageOption {
  id: AppLanguage;
  flag: string;
  code: string;
  /** Compact display: flag + short code (e.g. "🇬🇧 EN"). */
  display: string;
}
