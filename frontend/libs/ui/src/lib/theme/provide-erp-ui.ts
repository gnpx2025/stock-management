import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { NOTIFICATION_HANDLER } from '@erp/core';
import { DARK_MODE_CLASS } from './theme.service';
import { ToastNotificationService } from '../notifications/toast-notification.service';

export function provideErpUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MessageService,
    ToastNotificationService,
    {
      provide: NOTIFICATION_HANDLER,
      useExisting: ToastNotificationService,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: `.${DARK_MODE_CLASS}`,
        },
      },
    }),
  ]);
}
