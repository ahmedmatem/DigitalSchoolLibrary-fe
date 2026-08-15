import {
  Component,
  input,
} from '@angular/core';

export type IconButtonSize =
  | 'sm'
  | 'md'
  | 'lg';

export type IconButtonVariant =
  | 'default'
  | 'ghost'
  | 'primary'
  | 'danger';

@Component({
  selector: 'sl-icon-button',
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
})
export class IconButton {
  readonly ariaLabel = input.required<string>();

  readonly size = input<IconButtonSize>('md');

  readonly variant = input<IconButtonVariant>('default');

  readonly disabled = input(false);

  readonly type = input<'button' | 'submit' | 'reset'>('button');
}