import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { HealthStatus } from '@erp/contracts';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

@Injectable({ providedIn: 'root' })
export class PlatformHealthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getPlatformHealth(): Observable<HealthStatus> {
    const url = `${this.config.apiBaseUrl}/api/v1/platform/health`;
    return this.http.get<HealthStatus>(url);
  }
}

/** Pure helper for unit tests / foundation home display. */
export function summarizeHealth(status: HealthStatus | null | undefined): string {
  if (!status) {
    return 'Unknown';
  }
  return status.status;
}

export function isPlatformHealthy(
  status: HealthStatus | null | undefined,
): boolean {
  return status?.status === 'Healthy';
}
