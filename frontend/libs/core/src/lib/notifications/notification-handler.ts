import { InjectionToken } from '@angular/core';
import type { NotificationMessage } from '@erp/contracts';

export interface NotificationHandler {
  show(message: NotificationMessage): void;
}

export const NOTIFICATION_HANDLER = new InjectionToken<NotificationHandler>(
  'NOTIFICATION_HANDLER',
);
