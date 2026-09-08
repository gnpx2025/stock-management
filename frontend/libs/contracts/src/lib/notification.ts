export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

export interface NotificationMessage {
  severity: NotificationSeverity;
  summary: string;
  detail?: string;
  lifeMs?: number;
}
