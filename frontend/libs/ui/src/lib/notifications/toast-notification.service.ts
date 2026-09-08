import { Injectable, inject } from '@angular/core';
import type { NotificationMessage } from '@erp/contracts';
import { MessageService } from 'primeng/api';
import type { NotificationHandler } from '@erp/core';

@Injectable()
export class ToastNotificationService implements NotificationHandler {
  private readonly messages = inject(MessageService);

  show(message: NotificationMessage): void {
    this.messages.add({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      life: message.lifeMs ?? 4000,
    });
  }

  success(summary: string, detail?: string): void {
    this.show({ severity: 'success', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.show({ severity: 'info', summary, detail });
  }

  warn(summary: string, detail?: string): void {
    this.show({ severity: 'warn', summary, detail });
  }

  error(summary: string, detail?: string): void {
    this.show({ severity: 'error', summary, detail });
  }
}
