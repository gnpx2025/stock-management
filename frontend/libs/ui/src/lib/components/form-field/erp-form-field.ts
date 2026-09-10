import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChild,
  effect,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ControlContainer,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import type { MatChipInputEvent } from '@angular/material/chips';
import {
  MatDatepicker,
  MatDatepickerModule,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import type { MatDatepickerInputEvent } from '@angular/material/datepicker';
import {
  MatFormField,
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { MatSelectChange } from '@angular/material/select';
import {
  MatTimepicker,
  MatTimepickerModule,
} from '@angular/material/timepicker';
import { ErpIconComponent } from '../icon/erp-icon';
import { ErpPrefixDirective } from './erp-prefix';
import { ErpSuffixDirective } from './erp-suffix';

/** Material controls that register as MatFormFieldControl (plus input helpers). */
export type ErpFormFieldControl =
  | 'input'
  | 'textarea'
  | 'select'
  | 'native-select'
  | 'datepicker'
  | 'date-range'
  | 'timepicker'
  | 'autocomplete'
  | 'chip-grid';

export interface ErpFormFieldOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface ErpFormFieldOptionGroup<T = unknown> {
  label: string;
  options: ErpFormFieldOption<T>[];
  disabled?: boolean;
}

/**
 * Material form-field composition covering every built-in MatFormFieldControl.
 * Controls are rendered in-template (not projected) so Material can discover them.
 * Prefix/suffix still project via `erpPrefix` / `erpSuffix`.
 *
 * Disabled state is applied via the reactive FormControl API (not `[disabled]`),
 * which avoids Angular’s reactive-forms warning.
 */
@Component({
  selector: 'erp-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatChipsModule,
    ReactiveFormsModule,
    ErpIconComponent,
  ],
  templateUrl: './erp-form-field.html',
  styleUrl: './erp-form-field.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class ErpFormFieldComponent {
  private readonly controlContainer = inject(ControlContainer);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);

  private readonly formField = viewChild.required(MatFormField);
  protected readonly datepicker = viewChild<MatDatepicker<Date>>('datepicker');
  protected readonly rangePicker =
    viewChild<MatDateRangePicker<Date>>('rangePicker');
  private readonly dateRangeInput = viewChild(MatDateRangeInput);
  protected readonly timepicker = viewChild<MatTimepicker<Date>>('timepicker');

  /**
   * Date-range’s first CD can run before MatFormField resolves `_control`
   * (Material reads `shouldLabelFloat` unsafely). Keep a bridge control in the
   * field until the range input is created and explicitly wired.
   */
  protected readonly dateRangeReady = signal(false);
  protected readonly dateRangeWired = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (this.control() !== 'chip-grid') {
        return;
      }
      const name = this.controlName();
      const ctrl = name ? this.controlContainer.control?.get(name) : null;
      if (!ctrl) {
        return;
      }
      const sub = ctrl.valueChanges.subscribe(() => this.cdr.markForCheck());
      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      const disabled = this.disabled();
      for (const name of this.boundControlNames()) {
        const ctrl = this.controlContainer.control?.get(name);
        if (!ctrl) {
          continue;
        }
        if (disabled && ctrl.enabled) {
          ctrl.disable({ emitEvent: false });
        } else if (!disabled && ctrl.disabled) {
          ctrl.enable({ emitEvent: false });
        }
      }
    });

    afterNextRender(
      () => {
        if (this.control() !== 'date-range') {
          return;
        }
        this.dateRangeReady.set(true);
        this.cdr.detectChanges();
        const range = this.dateRangeInput();
        const field = this.formField();
        if (range && field) {
          field._control = range;
        }
        this.dateRangeWired.set(true);
        this.cdr.markForCheck();
      },
      { injector: this.injector },
    );
  }

  // --- Field chrome ---
  readonly label = input<string>();
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly appearance = input<MatFormFieldAppearance>('fill');

  // --- Control selection / binding ---
  readonly control = input<ErpFormFieldControl>('input');
  /** Reactive form control name. Required for all controls except `date-range`. */
  readonly controlName = input<string>();
  readonly startControlName = input<string>();
  readonly endControlName = input<string>();

  // --- Shared control inputs ---
  readonly inputId = input<string>();
  readonly name = input<string>();
  readonly placeholder = input<string>();
  readonly startPlaceholder = input<string>();
  readonly endPlaceholder = input<string>();
  readonly autocomplete = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabledInteractive = input(false, { transform: booleanAttribute });

  // --- input / textarea ---
  readonly type = input('text');
  readonly rows = input(3);

  // --- select / native-select / autocomplete options ---
  readonly options = input<ErpFormFieldOption[]>([]);
  readonly optionGroups = input<ErpFormFieldOptionGroup[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly panelClass = input<string | string[]>();
  readonly panelWidth = input<string | number | null>('auto');
  readonly compareWith = input<(o1: unknown, o2: unknown) => boolean>(
    (o1, o2) => o1 === o2,
  );
  readonly disableOptionCentering = input(false, { transform: booleanAttribute });
  readonly hideSingleSelectionIndicator = input(false, {
    transform: booleanAttribute,
  });
  readonly ariaLabel = input('');
  readonly ariaLabelledby = input('');
  readonly displayWith = input<(value: unknown) => string>();
  readonly autoActiveFirstOption = input(false, { transform: booleanAttribute });

  // --- datepicker / date-range / timepicker ---
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly dateFilter = input<(date: Date | null) => boolean>();
  readonly touchUi = input(false, { transform: booleanAttribute });
  readonly separator = input('–');

  // --- chip-grid ---
  readonly chipSeparatorKeyCodes = input<readonly number[]>([ENTER, COMMA]);
  readonly chipAddOnBlur = input(true, { transform: booleanAttribute });
  readonly chipInputPlaceholder = input('Add…');

  // --- Outputs ---
  readonly selectionChange = output<MatSelectChange>();
  readonly openedChange = output<boolean>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly valueChange = output<unknown>();
  readonly dateInput = output<MatDatepickerInputEvent<Date>>();
  readonly dateChange = output<MatDatepickerInputEvent<Date>>();
  readonly optionSelected = output<MatAutocompleteSelectedEvent>();
  readonly chipInputTokenEnd = output<MatChipInputEvent>();
  readonly chipRemoved = output<string>();

  protected readonly prefix = contentChild(ErpPrefixDirective);
  protected readonly suffix = contentChild(ErpSuffixDirective);

  protected showPickerSuffix(): boolean {
    const kind = this.control();
    return (
      kind === 'datepicker' || kind === 'date-range' || kind === 'timepicker'
    );
  }

  private boundControlNames(): string[] {
    if (this.control() === 'date-range') {
      return [this.startControlName(), this.endControlName()].filter(
        (name): name is string => !!name,
      );
    }
    const name = this.controlName();
    return name ? [name] : [];
  }

  protected chipValues(): string[] {
    const name = this.controlName();
    if (!name) {
      return [];
    }
    const value = this.controlContainer.control?.get(name)?.value;
    return Array.isArray(value) ? (value as string[]) : [];
  }

  protected removeChip(chip: string): void {
    const name = this.controlName();
    const ctrl = name ? this.controlContainer.control?.get(name) : null;
    if (!ctrl) {
      return;
    }
    ctrl.setValue(this.chipValues().filter((value) => value !== chip));
    ctrl.markAsDirty();
    this.chipRemoved.emit(chip);
  }

  protected addChipFromInput(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();
    event.chipInput.clear();
    this.chipInputTokenEnd.emit(event);
    if (!value) {
      return;
    }
    const name = this.controlName();
    const ctrl = name ? this.controlContainer.control?.get(name) : null;
    if (!ctrl) {
      return;
    }
    const current = this.chipValues();
    if (!current.includes(value)) {
      ctrl.setValue([...current, value]);
      ctrl.markAsDirty();
    }
  }
}
