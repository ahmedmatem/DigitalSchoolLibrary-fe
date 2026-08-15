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

import { ResourceCard } from '../../../../shared/ui/resource-card/resource-card';
import { ResourceCardVm } from '../../../../shared/ui/resource-card/resource-card.model';
import { Pagination } from '../../../../shared/ui/pagination/pagination';

@Component({
  selector: 'sl-catalog-page',
  imports: [
    PageContainer,
    SearchField,
    IconButton,
    Skeleton,
    ResourceCard,
    Pagination,

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
  readonly currentPage = signal(1);

  readonly demoResource: ResourceCardVm = {
    id: '1',
    title: 'Въведение в алгоритмите и структурите от данни',
    author: 'Иван Петров',
    description:
      'Учебен ресурс с основни понятия, примери и задачи за алгоритми и структури от данни.',
    subject: 'Информатика',
    category: 'Учебни материали',
    resourceType: 'PDF',
    grade: '11 клас',
    isSaved: false,
  };

  onResourceOpen(id: string): void {
    console.log('Open resource:', id);
  }
}