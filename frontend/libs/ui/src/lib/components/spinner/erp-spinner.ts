import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'erp-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  templateUrl: './erp-spinner.html',
  styleUrl: './erp-spinner.scss',
})
export class ErpSpinnerComponent {
  readonly diameter = input(40);
  readonly strokeWidth = input(4);
}
