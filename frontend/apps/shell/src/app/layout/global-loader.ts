import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '@erp/core';
import { ErpSpinnerComponent } from '@erp/ui';

@Component({
  selector: 'app-global-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErpSpinnerComponent],
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.scss',
})
export class GlobalLoaderComponent {
  protected readonly loading = inject(LoadingService);
}
