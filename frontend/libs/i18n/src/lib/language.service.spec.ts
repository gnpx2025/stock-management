import { TestBed } from '@angular/core/testing';
import { LANGUAGE_STORAGE_KEY, LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    document.documentElement.removeAttribute('lang');
    document.documentElement.removeAttribute('dir');
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  });

  it('defaults to en + ltr when nothing is stored', () => {
    expect(service.language()).toBe('en');
    expect(service.direction()).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('restores ar from localStorage', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ar');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(LanguageService);
    expect(restored.language()).toBe('ar');
    expect(restored.direction()).toBe('rtl');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'EN');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(LanguageService);
    expect(restored.language()).toBe('en');
  });

  it('persists language id as en|ar and applies direction', () => {
    service.setLanguage('ar');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ar');
    expect(service.language()).toBe('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');

    service.setLanguage('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('translates catalog keys and falls back for missing keys', () => {
    expect(service.t('shell.language.label')).toBe('Language');
    expect(service.t('missing.key', 'Fallback')).toBe('Fallback');
    expect(service.t('missing.key')).toBe('missing.key');
  });

  it('keeps prior language when simulateCatalogLoadFailure is called', () => {
    service.setLanguage('ar');
    service.simulateCatalogLoadFailure();
    expect(service.language()).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
