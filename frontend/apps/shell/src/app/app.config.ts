import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideErpCore, loadAppConfig } from '@erp/core';
import { provideErpI18n } from '@erp/i18n';
import { provideErpUi } from '@erp/ui';
import { appRoutes } from './app.routes';

export async function createAppConfig(): Promise<ApplicationConfig> {
  const config = await loadAppConfig('/config.json');

  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideAnimationsAsync(),
      provideRouter(appRoutes),
      provideErpCore(config),
      provideErpUi(),
      provideErpI18n(),
    ],
  };
}

/** Eager export used after bootstrap.ts loads config asynchronously. */
export const appConfigPromise = createAppConfig();
