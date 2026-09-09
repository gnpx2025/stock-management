import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { NotificationMessage, NotificationSeverity } from '@erp/contracts';
import type { NotificationHandler } from '@erp/core';

@Injectable()
export class ToastNotificationService implements NotificationHandler {
  private readonly snackBar = inject(MatSnackBar);

  show(message: NotificationMessage): void {
    const text = message.detail
      ? `${message.summary}: ${message.detail}`
      : message.summary;

    this.snackBar.open(text, undefined, {
      duration: message.lifeMs ?? 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [this.panelClass(message.severity)],
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

  private panelClass(severity: NotificationSeverity): string {
    return `erp-snackbar-${severity}`;
  }
}
