import {
  Component,
  input,
} from '@angular/core';

export type SkeletonRadius =
  | 'sm'
  | 'md'
  | 'lg'
  | 'round';

@Component({
  selector: 'sl-skeleton',
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('16px');

  readonly radius = input<SkeletonRadius>('md');
}