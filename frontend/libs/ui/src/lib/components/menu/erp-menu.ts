import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  MatButtonAppearance,
  MatButtonModule,
} from '@angular/material/button';
import { MatMenuModule, MenuPositionX, MenuPositionY } from '@angular/material/menu';

export interface ErpMenuItem {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
  /** Disabled, emphasized row (e.g. account name). */
  readonly header?: boolean;
  readonly ariaCurrent?: boolean | 'true' | 'page';
}

@Component({
  selector: 'erp-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatMenuModule, NgTemplateOutlet, NgClass],
  templateUrl: './erp-menu.html',
  styleUrl: './erp-menu.scss',
})
export class ErpMenuComponent {
  readonly items = input.required<readonly ErpMenuItem[]>();
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly triggerClass = input<string | undefined>(undefined);
  /** When set, trigger uses Material button appearance; omit for a plain trigger. */
  readonly triggerAppearance = input<MatButtonAppearance | null>(null);
  readonly xPosition = input<MenuPositionX>('after');
  readonly yPosition = input<MenuPositionY>('below');

  readonly itemSelected = output<ErpMenuItem>();

  protected onItemClick(item: ErpMenuItem): void {
    if (item.disabled || item.header) {
      return;
    }
    this.itemSelected.emit(item);
  }
}
