import { Component, input, output } from '@angular/core';

export type ChipVariant =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error';

@Component({
  selector: 'sl-chip',
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  readonly variant = input<ChipVariant>('default');
  readonly removable = input(false);

  readonly removed = output<void>();
}