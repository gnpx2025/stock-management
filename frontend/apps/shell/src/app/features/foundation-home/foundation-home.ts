import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import type { HealthStatus } from '@erp/contracts';
import {
  APP_CONFIG,
  LoadingService,
  PlatformHealthService,
  isPlatformHealthy,
  summarizeHealth,
} from '@erp/core';
import { ToastNotificationService, ThemeService } from '@erp/ui';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-foundation-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Tag, Card, DatePipe],
  templateUrl: './foundation-home.html',
  styleUrl: './foundation-home.scss',
})
export class FoundationHomeComponent implements OnInit {
  private readonly healthApi = inject(PlatformHealthService);
  private readonly notifications = inject(ToastNotificationService);
  private readonly loading = inject(LoadingService);
  protected readonly theme = inject(ThemeService);
  protected readonly config = inject(APP_CONFIG);

  protected readonly health = signal<HealthStatus | null>(null);
  protected readonly healthError = signal<string | null>(null);
  protected readonly loadingHealth = signal(false);

  ngOnInit(): void {
    this.refreshHealth();
  }

  protected statusLabel(): string {
    return summarizeHealth(this.health());
  }

  protected statusSeverity(): 'success' | 'warn' | 'danger' | 'secondary' {
    const status = this.health()?.status;
    if (status === 'Healthy') return 'success';
    if (status === 'Degraded') return 'warn';
    if (status === 'Unhealthy') return 'danger';
    return 'secondary';
  }

  protected isHealthy(): boolean {
    return isPlatformHealthy(this.health());
  }

  refreshHealth(): void {
    this.loadingHealth.set(true);
    this.healthError.set(null);
    this.healthApi
      .getPlatformHealth()
      .pipe(finalize(() => this.loadingHealth.set(false)))
      .subscribe({
        next: (status) => this.health.set(status),
        error: (err: unknown) => {
          this.health.set(null);
          this.healthError.set(
            err instanceof Error ? err.message : 'Unable to reach platform health',
          );
        },
      });
  }

  demoLoader(): void {
    this.loading.show();
    window.setTimeout(() => this.loading.hide(), 1500);
  }

  demoToast(): void {
    this.notifications.success(
      'Notification foundation',
      'PrimeNG toast is wired through the shared notification facade.',
    );
  }
}
