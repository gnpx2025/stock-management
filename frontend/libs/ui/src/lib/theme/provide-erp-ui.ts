import {
  EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { NOTIFICATION_HANDLER } from '@erp/core';
import { ToastNotificationService } from '../notifications/toast-notification.service';

export function provideErpUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ToastNotificationService,
    {
      provide: NOTIFICATION_HANDLER,
      useExisting: ToastNotificationService,
    },
  ]);
}
