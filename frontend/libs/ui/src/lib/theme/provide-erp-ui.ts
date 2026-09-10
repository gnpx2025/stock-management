import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NOTIFICATION_HANDLER } from '@erp/core';
import { ToastNotificationService } from '../notifications/toast-notification.service';

export function provideErpUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ToastNotificationService,
    ...provideNativeDateAdapter(),
    {
      provide: NOTIFICATION_HANDLER,
      useExisting: ToastNotificationService,
    },
  ]);
}
