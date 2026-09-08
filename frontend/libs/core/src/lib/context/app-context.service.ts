import { Injectable, signal } from '@angular/core';
import type { AppContext } from '@erp/contracts';

/** Placeholder for future company/branch/financial-year context. */
@Injectable({ providedIn: 'root' })
export class AppContextService {
  private readonly context = signal<AppContext | null>(null);

  readonly current = this.context.asReadonly();

  getSnapshot(): AppContext | null {
    return this.context();
  }

  clear(): void {
    this.context.set(null);
  }
}
