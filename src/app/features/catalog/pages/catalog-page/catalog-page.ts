import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageContainer } from '../../../../layout/page-container/page-container';

import { SearchField } from '../../../../shared/ui/search-field/search-field';
import { Chip } from '../../../../shared/ui/chip/chip';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { ResourceCard } from '../../../../shared/ui/resource-card/resource-card';
import { CatalogFilters } from '../../components/catalog-filters/catalog-filters';

import { ResourceApiService } from '../../data-access/resource-api.service';

import { LookupApiService } from '../../data-access/lookup-api.service';

import {
  SubjectLookupDto,
  GradeLevelLookupDto,
} from '../../models/lookup.models';

import { mapPublicResourceToCard } from '../../data-access/resource.mapper';

import { PublicCatalogRequest } from '../../models/public-catalog-request.model';

import { ResourceCardVm } from '../../../../shared/ui/resource-card/resource-card.model';

import { CatalogQuery, CatalogSort} from '../../models/catalog-query.model';
import { CATALOG_MOCK_RESOURCES } from '../../data-access/catalog.mock';

import { CatalogSkeleton } from '../../components/catalog-skeleton/catalog-skeleton';
import { CatalogState } from '../../components/catalog-state/catalog-state';

const DEFAULT_QUERY: CatalogQuery = {
  search: '',
  subject: null,
  grade: null,
  resourceType: null,
  sort: 'newest',
  page: 1,
  pageSize: 12,
};

const USE_REAL_API = false; // Set to true to use real API instead of mock data

@Component({
  selector: 'sl-catalog-page',
  imports: [
    PageContainer,
    SearchField,
    Chip,
    Pagination,
    ResourceCard,
    CatalogFilters,
    CatalogSkeleton,
    CatalogState
  ],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  readonly query = signal<CatalogQuery>({ ...DEFAULT_QUERY });

  private readonly resourceApi = inject(ResourceApiService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly lookupApi = inject(LookupApiService);

  readonly subjects = signal<SubjectLookupDto[]>([]);

  readonly gradeLevels = signal<GradeLevelLookupDto[]>([]);

  /* 
  Temporary signals for loading and error states. 
  In a real application, these would be managed by a service 
  that fetches data from an API.
   */
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly resources = signal<ResourceCardVm[]>([
    ... CATALOG_MOCK_RESOURCES
  ]);

  constructor() {
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(params => {
        const sort = this.parseSort(
            params.get('sort')
          );

        const page = this.parsePage(
            params.get('page')
          );

        this.query.set({
          search: params.get('search') ?? '',
          subject: params.get('subject'),
          grade: this.parseGrade(params.get('grade')),
          resourceType: params.get('type'),
          sort,
          page,
          pageSize: 12,
        });

        if (USE_REAL_API) {
          this.loadPublicCatalog();
        }
      });

      this.loadLookups();
  }

  readonly apiTotalCount = signal(0);
  readonly apiTotalPages = signal(1);

  readonly resultCount = computed(
    () => this.filteredResources().length
  );

  readonly totalPages = computed(() => {
    const count = this.filteredResources().length;
    const pageSize = this.query().pageSize;
    return Math.max(1, Math.ceil(count / pageSize));
  });

  readonly activeFilters = computed<string[]>(() => {
    const query = this.query();

    const filters: string[] = [];

    if (query.subject) {
      filters.push(query.subject);
    }

    if (query.grade !== null) {
      filters.push(`${query.grade} клас`);
    }

    if (query.resourceType) {
      filters.push(query.resourceType);
    }

    return filters;
  });

  readonly pagedResources = computed(() => {
    const query = this.query();

    const validPage = Math.min(query.page, this.totalPages());

    const start = (validPage - 1) * query.pageSize;

    return this.filteredResources()
      .slice(
        start,
        start + query.pageSize
      );
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

  /*
  Temporary methods for simulating loading and error states. 
  In a real application, these would be handled by a service 
  that fetches data from an API.
  */
  retryLoad(): void {
    if (USE_REAL_API) {
      this.loadPublicCatalog();
      return;
    }

    this.error.set(null);
  }

  updateSearch(search: string): void {
    this.updateQuery(
      {
        search,
        page: 1,
      },
      true /* replaceUrl */
    );
  }

  updateSort(sort: CatalogSort): void {
    this.updateQuery({
      sort,
      page: 1,
    });
  }

  updatePage(page: number): void {
      this.updateQuery({
        page,
      });

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

  updateSubject(subject: string | null): void {
    this.updateQuery({
      subject,
      page: 1,
    });
  }

  updateGrade(grade: number | null): void {
    this.updateQuery({
      grade,
      page: 1,
    });
  }

  updateResourceType(resourceType: string | null): void {
    this.updateQuery({
      resourceType,
      page: 1,
    });
  }

  clearFilters(): void {
    this.updateQuery({
      subject: null,
      grade: null,
      resourceType: null,
      page: 1,
    });
  }

  resetCatalog(): void {
    this.query.set({
      ...DEFAULT_QUERY,
    });

    void this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {},
      }
    );
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

  private parsePage(value: string | null): number {
    const page = Number(value);

    if (!Number.isInteger(page) || page < 1) {
      return 1;
    }

    return page;
  }

  private parseSort(value: string | null): CatalogSort {
    switch (value) {
      case 'oldest':
      case 'title-asc':
      case 'title-desc':
      case 'newest':
        return value;

      default:
        return 'newest';
    }
  }

  private updateQuery(changes: Partial<CatalogQuery>, replaceUrl = false): void {
    const nextQuery: CatalogQuery = {
      ...this.query(),
      ...changes,
    };

    this.query.set(nextQuery);

    void this.router.navigate(
      [],
      {
        relativeTo: this.route,

        queryParams: {
          search:
            nextQuery.search || null,

          subject:
            nextQuery.subject,

          grade:
            nextQuery.grade,

          type:
            nextQuery.resourceType,

          sort:
            nextQuery.sort === 'newest'
              ? null
              : nextQuery.sort,

          page:
            nextQuery.page === 1
              ? null
              : nextQuery.page,
        },

        replaceUrl,
      }
    );
  }

  private parseGrade(value: string | null): number | null {
    if (!value) return null;

    const grade = Number(value);

    if (!Number.isInteger(grade) || grade <  5 || grade > 12) {
      return null;
    }

    return grade;
  }

  private loadPublicCatalog(): void {
    const query = this.query();

    const request: PublicCatalogRequest = {
      search: query.search.trim() || undefined,

      page: query.page,

      pageSize: query.pageSize,
    };

    this.loading.set(true);
    this.error.set(null);

    this.resourceApi
      .getPublicCatalog(request)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: response => {
          const resources =
            response.items.map(
              mapPublicResourceToCard
            );

          this.resources.set(resources);

          this.apiTotalCount.set(response.totalCount);

          this.apiTotalPages.set(response.totalPages);

          this.loading.set(false);
        },

        error: () => {
          this.error.set(
            'Възникна проблем при зареждането на ресурсите.'
          );

          this.loading.set(false);
        },
      });
  }

  private loadLookups(): void {
    this.lookupApi
      .getSubjects()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: subjects => {
          this.subjects.set(subjects);
        },
      });

    this.lookupApi
      .getGradeLevels()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: grades => {
          this.gradeLevels.set(grades);
        },
      });
  }
}