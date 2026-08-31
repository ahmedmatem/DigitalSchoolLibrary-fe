import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  forkJoin,
  switchMap,
  tap,
} from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PageContainer } from '../../../../layout/page-container/page-container';

import { SearchField } from '../../../../shared/ui/search-field/search-field';
import { Chip } from '../../../../shared/ui/chip/chip';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { ResourceCard } from '../../../../shared/ui/resource-card/resource-card';
import { CatalogFilters } from '../../components/catalog-filters/catalog-filters';

import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';

import { LookupApiService } from '../../../../core/lookups/services/lookup-api.service';

import {
  SubjectLookup,
  CategoryLookup,
  GradeLevelLookup,
} from '../../../../core/lookups/models/lookup.models';

import { mapPublicResourceToCard } from '../../data-access/resource.mapper';

import { ResourceCatalogRequest } from '../../../../core/resources/models/resource-catalog-request.model';

import { ResourceCardVm } from '../../../../shared/ui/resource-card/resource-card.model';

import { CatalogQuery, CatalogSort} from '../../models/catalog-query.model';

import { CatalogSkeleton } from '../../components/catalog-skeleton/catalog-skeleton';
import { CatalogState } from '../../components/catalog-state/catalog-state';

import { RESOURCE_TYPE_OPTIONS } from '../../../../core/models/resource-type.model';
import { ResourceSortOption } from '../../../../core/models/resource-sort.model';

const DEFAULT_QUERY: CatalogQuery = {
  search: '',
  subject: null,
  category: null,
  grade: null,
  resourceType: null,
  sort: 'newest',
  page: 1,
  pageSize: 12,
};

const USE_REAL_API = true;

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

  readonly subjects = signal<SubjectLookup[]>([]);

  readonly categories = signal<CategoryLookup[]>([]);

  readonly gradeLevels = signal<GradeLevelLookup[]>([]);

  readonly selectedResourceType = computed<number | null>(() => {
    const resourceType = this.query().resourceType;

    if (!resourceType) {
      return null;
    }

    return (
      this.resourceTypes
        .find(
          item =>
            item.label === resourceType
        )
        ?.value ?? null
    );
  });

  readonly resourceTypes = RESOURCE_TYPE_OPTIONS;

  /* 
  Temporary signals for loading and error states. 
  In a real application, these would be managed by a service 
  that fetches data from an API.
   */
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly resources = signal<ResourceCardVm[]>([]);

  readonly selectedSubjectId =
  computed<string | null>(() => {
    const subjectName =
      this.query().subject;

    if (!subjectName) {
      return null;
    }

    return (
      this.subjects()
        .find(
          subject =>
            subject.name === subjectName
        )
        ?.id ?? null
    );
  });

  readonly selectedCategoryId =
  computed<string | null>(() => {
    const categoryName =
      this.query().category;

    if (!categoryName) {
      return null;
    }

    return (
      this.categories()
        .find(
          category =>
            category.name === categoryName
        )
        ?.id ?? null
    );
  });

  readonly selectedGradeLevelId =
  computed<number | null>(() => {
    const grade =
      this.query().grade;

    if (grade === null) {
      return null;
    }

    return (
      this.gradeLevels()
        .find(
          gradeLevel =>
            gradeLevel.number === grade
        )
        ?.id ?? null
    );
  });

  constructor() {
    forkJoin({
      subjects: this.lookupApi.getSubjects(),
      categories: this.lookupApi.getCategories(),
      grades: this.lookupApi.getGradeLevels(),
    })
      .pipe(
        tap(({ subjects, categories, grades }) => {
          this.subjects.set(subjects);
          this.categories.set(categories);
          this.gradeLevels.set(grades);
        }),

        switchMap(() =>
          this.route.queryParamMap
        ),

        takeUntilDestroyed(
          this.destroyRef
        )
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

          category: params.get('category'),

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
  }

  readonly apiTotalCount = signal(0);
  readonly apiTotalPages = signal(1);

  readonly resultCount = computed(() => {
    return this.apiTotalCount();
  });

  readonly totalPages = computed(() =>
    Math.max(1, this.apiTotalPages())
  );

  readonly activeFilters = computed<string[]>(() => {
    const query = this.query();

    const filters: string[] = [];

    if (query.subject) {
      filters.push(query.subject);
    }

    if (query.category) {
      filters.push(query.category);
    }

    if (query.grade !== null) {
      filters.push(`${query.grade} клас`);
    }

    if (query.resourceType) {
      filters.push(query.resourceType);
    }

    return filters;
  });

  retryLoad(): void {
    this.loadPublicCatalog();
  }

  updateSubjectById(
    subjectId: string | null
  ): void {
    if (!subjectId) {
      this.updateSubject(null);
      return;
    }

    const subject =
      this.subjects()
        .find(
          item =>
            item.id === subjectId
        );

    this.updateSubject(
      subject?.name ?? null
    );
  }

  updateCategoryById(categoryId: string | null): void {
    if (!categoryId) {
      this.updateCategory(null);
      return;
    }

    const category =
      this.categories()
        .find(
          item =>
            item.id === categoryId
        );

    this.updateCategory(category?.name ?? null);
  }

  updateGradeById(
    gradeLevelId: number | null
  ): void {
    if (gradeLevelId === null) {
      this.updateGrade(null);
      return;
    }

    const gradeLevel =
      this.gradeLevels()
        .find(
          item =>
            item.id === gradeLevelId
        );

    this.updateGrade(
      gradeLevel?.number ?? null
    );
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

  updateCategory(category: string | null): void {
    this.updateQuery({
      category,
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
      category: null,
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
     void this.router.navigate(['/resources', id,]);
  }

  onSavedChange(resourceId: string, saved: boolean): void {
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
          search: nextQuery.search || null,

          subject: nextQuery.subject,

          category: nextQuery.category,

          grade: nextQuery.grade,

          type: nextQuery.resourceType,

          sort: nextQuery.sort === 'newest'
              ? null
              : nextQuery.sort,

          page: nextQuery.page === 1
              ? null
              : nextQuery.page,
        },

        replaceUrl,
      }
    );
  }

  updateResourceTypeByValue(value: number | null): void {
    if (value === null) {
      this.updateResourceType(null);
      return;
    }

    const resourceType =
      this.resourceTypes.find(
        item =>
          item.value === value
      );

    this.updateResourceType(
      resourceType?.label ?? null
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
    const request = this.buildPublicCatalogRequest();

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
          const resources = response.items.map(mapPublicResourceToCard);

          this.resources.set(resources);

          this.loadCoverUrls(resources);

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

  private loadCoverUrls(resources: ResourceCardVm[]): void {
    for (const resource of resources) {
      if (!resource.hasCover) continue;

      this.resourceApi
        .getPublicCover(resource.id)
        .pipe(
          takeUntilDestroyed(
            this.destroyRef
          )
        )
        .subscribe({
          next: cover => {
            this.resources.update(items =>
              items.map(item =>
                item.id === resource.id
                  ? {
                      ...item,
                      coverUrl: cover.downloadUrl,
                    }
                  : item
              )
            );
          },

          error: () => {
            // Не чупим catalog-а,
            // ако само cover не може да се зареди.
            /*ако cover request се провали, картата просто остава с placeholder иконата.*/
          },
        });
    }
  }

  private mapSortToApi(sort: CatalogSort): ResourceSortOption {
    switch (sort) {
      case 'oldest':
        return ResourceSortOption.Oldest;

      case 'title-asc':
        return ResourceSortOption.TitleAscending;

      case 'title-desc':
        return ResourceSortOption.TitleDescending;

      case 'newest':
      default:
        return ResourceSortOption.Newest;
    }
  }

  private buildPublicCatalogRequest(): ResourceCatalogRequest {

    const query = this.query();

    const subject = query.subject
        ? this.subjects().find(item => item.name === query.subject)
        : undefined;

    const category = query.category
        ? this.categories().find(item => item.name === query.category)
        : undefined;

    const gradeLevel = query.grade !== null
        ? this.gradeLevels().find(item => item.number === query.grade)
        : undefined;

    const resourceType = query.resourceType
        ? this.resourceTypes.find(item => item.label === query.resourceType)
        : undefined;

    return {
      search: query.search.trim() || undefined,

      subjectId: subject?.id,

      categoryId: category?.id,

      gradeLevelId: gradeLevel?.id,

      type: resourceType?.value,

      sort: this.mapSortToApi(query.sort),

      page: query.page,

      pageSize: query.pageSize,
    };
  }
}