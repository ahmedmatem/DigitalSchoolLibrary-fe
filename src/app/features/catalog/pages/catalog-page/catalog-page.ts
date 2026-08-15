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
import { CatalogFilters } from '../../components/catalog-filters/catalog-filters';

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
    CatalogFilters,
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
      createdAt: '2026-08-10',
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
      createdAt: '2026-07-15',
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
      createdAt: '2026-08-12',
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
      createdAt: '2026-06-20',
    },
  ]);

  readonly resultCount = computed(
    () => this.filteredResources().length
  );

  readonly totalPages = computed(() => {
    const count = this.filteredResources().length;
    const pageSize = this.query().pageSize;
    return Math.max(1, Math.ceil(count / pageSize));
  });

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

  readonly pagedResources = computed(() => {
    const query = this.query();
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    return this.filteredResources().slice(start, end);
  });

  readonly filteredResources = computed(() => {
    const query = this.query();

    let result = [...this.resources()];

    const search = query.search
      .trim()
      .toLocaleLowerCase('bg-BG');

    if (search) {
      result = result.filter(resource => {
        const searchableText = [
          resource.title,
          resource.author,
          resource.description,
          resource.subject,
          resource.category,
          resource.resourceType,
          resource.grade,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('bg-BG');

        return searchableText.includes(search);
      });
    }

    if (query.subject) {
      result = result.filter(
        resource => resource.subject === query.subject
      );
    }

    if (query.grade) {
      result = result.filter(
        resource => resource.grade === query.grade
      );
    }

    if (query.resourceType) {
      result = result.filter(
        resource => resource.resourceType === query.resourceType
      );
    }

    switch (query.sort) {
      case 'oldest':
        result.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;

      case 'title-asc':
        result.sort(
          (a, b) => a.title.localeCompare(b.title, 'bg')
        );
        break;

      case 'title-desc':
        result.sort(
          (a, b) => b.title.localeCompare(a.title, 'bg')
        );
        break;

      case 'newest':
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
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

  updateSubject(subject: string | null): void {
    this.query.update(query => ({
      ...query,
      subject,
      page: 1,
    }));
  }

  updateGrade(grade: string | null): void {
    this.query.update(query => ({
      ...query,
      grade,
      page: 1,
    }));
  }

  updateResourceType(
    resourceType: string | null
  ): void {
    this.query.update(query => ({
      ...query,
      resourceType,
      page: 1,
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