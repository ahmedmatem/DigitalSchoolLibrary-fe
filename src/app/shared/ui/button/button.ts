import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'sl-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    '[class.sl-button-host]': 'true',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');

  readonly size = input<ButtonSize>('md');

  readonly type = input<ButtonType>('button');

  readonly loading = input(false);

  readonly disabled = input(false);

  readonly ariaLabel = input<string | null>(null);
}