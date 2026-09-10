import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, JsonPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
  ErpFormFieldComponent,
  ErpStatusChipComponent,
  ToastNotificationService,
  ThemeService,
  type ErpFormFieldOption,
  type ErpFormFieldOptionGroup,
  type ErpStatusTone,
} from '@erp/ui';
import { finalize, startWith } from 'rxjs';

@Component({
  selector: 'app-foundation-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    JsonPipe,
    ReactiveFormsModule,
    ErpButtonComponent,
    ErpCardComponent,
    ErpFormFieldComponent,
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
  private readonly fb = inject(FormBuilder);
  protected readonly theme = inject(ThemeService);
  protected readonly config = inject(APP_CONFIG);

  protected readonly health = signal<HealthStatus | null>(null);
  protected readonly healthError = signal<string | null>(null);
  protected readonly loadingHealth = signal(false);

  protected readonly countryOptions: ErpFormFieldOption[] = [
    { value: 'in', label: 'India' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'sg', label: 'Singapore' },
    { value: 'us', label: 'United States' },
  ];

  protected readonly regionGroups: ErpFormFieldOptionGroup[] = [
    {
      label: 'Asia',
      options: [
        { value: 'west', label: 'West' },
        { value: 'south', label: 'South' },
      ],
    },
    {
      label: 'Europe',
      options: [
        { value: 'north', label: 'North' },
        { value: 'central', label: 'Central', disabled: true },
      ],
    },
  ];

  protected readonly warehouseOptions: ErpFormFieldOption[] = [
    { value: 'blr', label: 'Bangalore DC' },
    { value: 'mum', label: 'Mumbai DC' },
    { value: 'del', label: 'Delhi DC' },
  ];

  private readonly productCatalog: ErpFormFieldOption[] = [
    { value: 'SKU-1001', label: 'SKU-1001 · Widget A' },
    { value: 'SKU-1002', label: 'SKU-1002 · Widget B' },
    { value: 'SKU-2040', label: 'SKU-2040 · Fastener Kit' },
    { value: 'SKU-3100', label: 'SKU-3100 · Packing Tape' },
  ];

  protected readonly formFields = this.fb.nonNullable.group({
    text: [''],
    notes: [''],
    country: [''],
    regions: [[] as string[]],
    warehouse: [''],
    dueDate: [null as Date | null],
    rangeStart: [null as Date | null],
    rangeEnd: [null as Date | null],
    slot: [null as Date | null],
    product: [''],
    tags: [['urgent', 'review'] as string[]],
  });

  private readonly productQuery = toSignal(
    this.formFields.controls.product.valueChanges.pipe(
      startWith(this.formFields.controls.product.value),
    ),
    { initialValue: this.formFields.controls.product.value },
  );

  protected readonly autocompleteOptions = computed(() => {
    const query = String(this.productQuery() ?? '')
      .trim()
      .toLowerCase();
    if (!query) {
      return this.productCatalog;
    }
    return this.productCatalog.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        String(opt.value).toLowerCase().includes(query),
    );
  });

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

  resetFormFields(): void {
    this.formFields.reset({
      text: '',
      notes: '',
      country: '',
      regions: [],
      warehouse: '',
      dueDate: null,
      rangeStart: null,
      rangeEnd: null,
      slot: null,
      product: '',
      tags: ['urgent', 'review'],
    });
  }
}
