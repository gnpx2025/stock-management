import { inject, provideAppInitializer } from '@angular/core';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AuthSessionService } from './auth-session.service';

/**
 * Restores an existing session via refresh when `erp_auth=1` is present,
 * before the app renders protected content.
 */
export function provideAuthInitializer(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const session = inject(AuthSessionService);
      return session.restoreFromRefresh();
    }),
  ]);
}
