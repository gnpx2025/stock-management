import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'erp-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './erp-icon.html',
  styleUrl: './erp-icon.scss',
})
export class ErpIconComponent {
  readonly name = input.required<string>();
  readonly ariaHidden = input(true);
}
