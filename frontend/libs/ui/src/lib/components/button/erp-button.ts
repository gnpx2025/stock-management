import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { ErpIconComponent } from '../icon/erp-icon';
import { ErpSpinnerComponent } from '../spinner/erp-spinner';

export type ErpButtonVariant = 'flat' | 'stroked' | 'basic' | 'icon';
export type ErpButtonColor = 'primary' | 'accent' | 'warn' | undefined;

@Component({
  selector: 'erp-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    NgTemplateOutlet,
    ErpIconComponent,
    ErpSpinnerComponent,
  ],
  templateUrl: './erp-button.html',
  styleUrl: './erp-button.scss',
})
export class ErpButtonComponent {
  readonly variant = input<ErpButtonVariant>('flat');
  readonly color = input<ErpButtonColor>(undefined);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly icon = input<string | undefined>(undefined);
  /** Prefer Material Icons Outlined for the leading/icon glyph. */
  readonly iconOutlined = input(true);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly spinnerDiameter = input(18);

  readonly clicked = output<MouseEvent>();

  readonly appearance = computed<MatButtonAppearance>(() => {
    switch (this.variant()) {
      case 'stroked':
        return 'outlined';
      case 'basic':
        return 'text';
      case 'flat':
      default:
        return 'filled';
    }
  });
}
