import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'erp-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
  templateUrl: './erp-card.html',
  styleUrl: './erp-card.scss',
})
export class ErpCardComponent {
  readonly title = input<string | undefined>(undefined);
}
