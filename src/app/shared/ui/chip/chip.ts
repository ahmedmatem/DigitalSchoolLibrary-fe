import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  LucideX,
} from '@lucide/angular';

export type ChipVariant =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error';

@Component({
  selector: 'sl-chip',
  imports: [
    LucideX,
  ],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  readonly variant = input<ChipVariant>('default');
  readonly removable = input(false);

  readonly removed = output<void>();
}