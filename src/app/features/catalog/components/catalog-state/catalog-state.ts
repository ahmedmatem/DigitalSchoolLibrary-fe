import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  LucideSearchX,
  LucideTriangleAlert,
} from '@lucide/angular';

import { Button } from '../../../../shared/ui/button/button';

export type CatalogStateType =
  | 'empty'
  | 'error';

@Component({
  selector: 'sl-catalog-state',
  imports: [
    Button,

    LucideSearchX,
    LucideTriangleAlert,
  ],
  templateUrl: './catalog-state.html',
  styleUrl: './catalog-state.scss',
})
export class CatalogState {
  readonly type = input<CatalogStateType>('empty');

  readonly title = input.required<string>();

  readonly message = input.required<string>();

  readonly actionLabel = input<string | null>(null);

  readonly action = output<void>();
}