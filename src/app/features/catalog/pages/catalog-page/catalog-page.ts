import {
  Component,
  computed,
  signal,
} from '@angular/core';

import { PageContainer } from '../../../../layout/page-container/page-container';

import { SearchField } from '../../../../shared/ui/search-field/search-field';
import { Chip } from '../../../../shared/ui/chip/chip';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { ResourceCard } from '../../../../shared/ui/resource-card/resource-card';

import { ResourceCardVm } from '../../../../shared/ui/resource-card/resource-card.model';

import { CatalogQuery, CatalogSort} from '../../models/catalog-query.model';

@Component({
  selector: 'sl-catalog-page',
  imports: [
    PageContainer,
    SearchField,
    Chip,
    Pagination,
    ResourceCard,
  ],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  readonly query = signal<CatalogQuery>({
    search: '',
    subject: null,
    grade: null,
    resourceType: null,
    sort: 'newest',
    page: 1,
    pageSize: 12,
  });

  readonly resources = signal<ResourceCardVm[]>([
    {
      id: '1',
      title: 'Въведение в алгоритмите',
      author: 'Иван Петров',
      description:
        'Основни алгоритми, структури от данни и практически примери.',
      subject: 'Информатика',
      category: 'Учебни материали',
      resourceType: 'PDF',
      grade: '11 клас',
      isSaved: false,
    },
    {
      id: '2',
      title: 'Квадратни уравнения',
      author: 'Мария Иванова',
      description:
        'Теория, решени примери и задачи за упражнение.',
      subject: 'Математика',
      category: 'Упражнения',
      resourceType: 'PDF',
      grade: '9 клас',
      isSaved: true,
    },
    {
      id: '3',
      title: 'Основи на SQL',
      author: 'Георги Георгиев',
      description:
        'SELECT, JOIN, GROUP BY и примери с релационни бази данни.',
      subject: 'Информатика',
      category: 'Учебни материали',
      resourceType: 'PDF',
      grade: '12 клас',
      isSaved: false,
    },
    {
      id: '4',
      title: 'Вектори в равнината',
      author: 'Елена Николова',
      description:
        'Координати, операции с вектори и геометрични приложения.',
      subject: 'Математика',
      category: 'Презентации',
      resourceType: 'PPTX',
      grade: '10 клас',
      isSaved: false,
    },
  ]);

  readonly resultCount = computed(
    () => this.resources().length
  );

  readonly totalPages = signal(4);

  readonly activeFilters = computed(() => {
    const query = this.query();

    return [
      query.subject,
      query.grade,
      query.resourceType,
    ].filter(
      (value): value is string =>
        value !== null
    );
  });

  updateSearch(search: string): void {
    this.query.update(query => ({
      ...query,
      search,
      page: 1,
    }));
  }

  updateSort(sort: CatalogSort): void {
    this.query.update(query => ({
      ...query,
      sort,
      page: 1,
    }));
  }

  updatePage(page: number): void {
    this.query.update(query => ({
      ...query,
      page,
    }));
  }

  clearFilters(): void {
    this.query.update(query => ({
      ...query,
      subject: null,
      grade: null,
      resourceType: null,
      page: 1,
    }));
  }

  openResource(id: string): void {
    console.log('Open resource:', id);
  }

  onSavedChange(
    resourceId: string,
    saved: boolean
  ): void {
    this.resources.update(resources =>
      resources.map(resource =>
        resource.id === resourceId
          ? {
              ...resource,
              isSaved: saved,
            }
          : resource
      )
    );
  }
}