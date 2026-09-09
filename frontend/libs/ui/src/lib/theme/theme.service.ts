import { Injectable, signal } from '@angular/core';
import type { ThemeMode } from '@erp/contracts';

const STORAGE_KEY = 'erp.themeMode';
export const DARK_MODE_CLASS = 'app-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly mode = signal<ThemeMode>(this.resolveInitialMode());

  readonly currentMode = this.mode.asReadonly();

  constructor() {
    this.apply(this.mode());
  }

  toggle(): void {
    this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.persist(mode);
    this.apply(mode);
  }

  private resolveInitialMode(): ThemeMode {
    if (typeof window === 'undefined') {
      return 'light';
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // ignore storage access errors
    }

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private persist(mode: ThemeMode): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }

  private apply(mode: ThemeMode): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.classList.toggle(DARK_MODE_CLASS, mode === 'dark');
    document.documentElement.style.colorScheme = mode;
  }
}
