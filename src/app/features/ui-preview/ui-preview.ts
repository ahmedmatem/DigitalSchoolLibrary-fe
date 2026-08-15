import {
  Component,
  signal,
} from '@angular/core';

import {
  LucideBookmark,
  LucideMenu,
  LucideSearch,
  LucideTrash2,
} from '@lucide/angular';

import { PageContainer } from '../../layout/page-container/page-container';

import { Button } from '../../shared/ui/button/button';
import { IconButton } from '../../shared/ui/icon-button/icon-button';
import { Chip } from '../../shared/ui/chip/chip';
import { SearchField } from '../../shared/ui/search-field/search-field';
import { Skeleton } from '../../shared/ui/skeleton/skeleton';
import { ResourceCard } from '../../shared/ui/resource-card/resource-card';
import { ResourceCardVm } from '../../shared/ui/resource-card/resource-card.model';
import { Pagination } from '../../shared/ui/pagination/pagination';

@Component({
  selector: 'sl-ui-preview',
  imports: [
    PageContainer,

    Button,
    IconButton,
    Chip,
    SearchField,
    Skeleton,
    ResourceCard,
    Pagination,

    LucideMenu,
    LucideSearch,
    LucideBookmark,
    LucideTrash2,
  ],
  templateUrl: './ui-preview.html',
  styleUrl: './ui-preview.scss',
})
export class UiPreview {
  readonly searchQuery = signal('');

  readonly currentPage = signal(5);

  readonly demoResource = signal<ResourceCardVm>({
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
    createdAt: '2026-08-10',
  });

  onSavedChange(saved: boolean): void {
    this.demoResource.update(resource => ({
      ...resource,
      isSaved: saved,
    }));
  }

  onResourceOpen(id: string): void {
    console.log('Open resource:', id);
  }
}