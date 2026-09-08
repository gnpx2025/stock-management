import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '@erp/core';

@Component({
  selector: 'app-global-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinner],
  template: `
    @if (loading.isLoading()) {
      <div class="global-loader" role="status" aria-live="polite" aria-label="Loading">
        <p-progressspinner [style]="{ width: '48px', height: '48px' }" strokeWidth="4" />
      </div>
    }
  `,
  styles: `
    .global-loader {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: grid;
      place-items: center;
      background: rgb(15 23 42 / 28%);
      backdrop-filter: blur(2px);
    }
  `,
})
export class GlobalLoaderComponent {
  protected readonly loading = inject(LoadingService);
}
