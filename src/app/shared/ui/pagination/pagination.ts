import {
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideMoreHorizontal,
} from '@lucide/angular';

import { IconButton } from '../icon-button/icon-button';

@Component({
  selector: 'sl-pagination',
  imports: [
    IconButton,

    LucideChevronLeft,
    LucideChevronRight,
    LucideMoreHorizontal,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page = input(1);
  readonly pageCount = input(1);

  readonly pageChange = output<number>();

  readonly pages = computed<(number | 'ellipsis')[]>(() => {
    const current = this.page();
    const total = this.pageCount();

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    if (current <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        'ellipsis',
        total,
      ];
    }

    if (current >= total - 3) {
      return [
        1,
        'ellipsis',
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      'ellipsis',
      current - 1,
      current,
      current + 1,
      'ellipsis',
      total,
    ];
  });

  previous(): void {
    if (this.page() > 1) {
      this.pageChange.emit(
        this.page() - 1
      );
    }
  }

  next(): void {
    if (this.page() < this.pageCount()) {
      this.pageChange.emit(
        this.page() + 1
      );
    }
  }

  selectPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.pageCount() &&
      page !== this.page()
    ) {
      this.pageChange.emit(page);
    }
  }
}