import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'erp-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './erp-icon.html',
  styleUrl: './erp-icon.scss',
  host: {
    class: 'd-inline-flex align-items-center justify-content-center',
    '[style.--erp-icon-size]': 'size() || null',
    '[class.erp-icon--sized]': '!!size()',
  },
})
export class ErpIconComponent {
  readonly name = input.required<string>();
  readonly ariaHidden = input(true);
  /** Optional CSS length (e.g. `1rem`, `20px`) for the icon glyph. */
  readonly size = input<string | undefined>(undefined);
  /** Use Material Icons Outlined instead of the filled set. */
  readonly outlined = input(true);

  protected readonly fontSet = computed(() =>
    this.outlined() ? 'material-icons-outlined' : 'material-icons',
  );
}