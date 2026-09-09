import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

export type ErpStatusTone = 'ok' | 'warn' | 'bad' | 'neutral';

@Component({
  selector: 'erp-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule],
  templateUrl: './erp-status-chip.html',
  styleUrl: './erp-status-chip.scss',
})
export class ErpStatusChipComponent {
  readonly tone = input<ErpStatusTone>('neutral');
  readonly ariaLabel = input('Status');
}
