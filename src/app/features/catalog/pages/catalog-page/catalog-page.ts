import { Component, signal } from '@angular/core';

import { PageContainer } from '../../../../layout/page-container/page-container';
import { SearchField } from '../../../../shared/ui/search-field/search-field';
import {
  LucideBookmark,
  LucideMenu,
  LucideSearch,
  LucideTrash2,
} from '@lucide/angular';

import { IconButton } from '../../../../shared/ui/icon-button/icon-button';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';

@Component({
  selector: 'sl-catalog-page',
  imports: [
    PageContainer,
    SearchField,
    IconButton,
    Skeleton,

    LucideMenu,
    LucideSearch,
    LucideBookmark,
    LucideTrash2,
  ],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  readonly searchQuery = signal('');
}