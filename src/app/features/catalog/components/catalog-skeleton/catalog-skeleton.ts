import { Component } from '@angular/core';

import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';

@Component({
  selector: 'sl-catalog-skeleton',
  imports: [
    Skeleton,
  ],
  templateUrl: './catalog-skeleton.html',
  styleUrl: './catalog-skeleton.scss',
})
export class CatalogSkeleton {
  readonly cards = Array.from(
    { length: 12 }
  );
}