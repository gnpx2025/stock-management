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
  AuthSessionService,
  LoadingService,
  PlatformHealthService,
  isPlatformHealthy,
  summarizeHealth,
} from '@erp/core';
import {
  ErpButtonComponent,
  ErpCardComponent,
  ErpStatusChipComponent,
  ToastNotificationService,
  ThemeService,
  type ErpStatusTone,
} from '@erp/ui';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-foundation-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ErpButtonComponent,
    ErpCardComponent,
    ErpStatusChipComponent,
  ],
  templateUrl: './foundation-home.html',
  styleUrl: './foundation-home.scss',
})
export class FoundationHomeComponent implements OnInit {
  private readonly healthApi = inject(PlatformHealthService);
  private readonly notifications = inject(ToastNotificationService);
  private readonly loading = inject(LoadingService);
  private readonly auth = inject(AuthSessionService);
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

  protected statusTone(): ErpStatusTone {
    const status = this.health()?.status;
    if (status === 'Healthy') return 'ok';
    if (status === 'Degraded') return 'warn';
    if (status === 'Unhealthy') return 'bad';
    return 'neutral';
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
      'Material snackbar is wired through the shared notification facade.',
    );
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
