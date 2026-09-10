import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { ErpIconComponent } from '../icon/erp-icon';

export interface ErpSearchOption {
  value: string;
  label: string;
}

@Component({
  selector: 'erp-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatAutocompleteModule, ErpIconComponent],
  templateUrl: './erp-search-input.html',
  styleUrl: './erp-search-input.scss',
  host: {
    class: 'd-block w-100 min-w-0',
  },
})
export class ErpSearchInputComponent {
  readonly placeholder = input('Search');
  readonly ariaLabel = input('Search');
  readonly options = input<readonly ErpSearchOption[]>([]);
  readonly disabled = input(false);

  readonly queryChange = output<string>();
  readonly optionSelected = output<ErpSearchOption>();

  protected readonly query = signal('');
  protected readonly focused = signal(false);

  protected readonly filteredOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const opts = this.options();
    if (!q) {
      return opts;
    }
    return opts.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q),
    );
  });

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.queryChange.emit(value);
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
  }

  protected onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const label = String(event.option.value ?? '');
    const match =
      this.options().find((opt) => opt.label === label) ??
      this.filteredOptions().find((opt) => opt.label === label);

    this.query.set(label);
    this.queryChange.emit(label);

    if (match) {
      this.optionSelected.emit(match);
    }
  }
}
