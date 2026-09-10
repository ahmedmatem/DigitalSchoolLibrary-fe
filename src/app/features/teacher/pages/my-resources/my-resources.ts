import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  forkJoin,
  finalize,
} from 'rxjs';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  Router,
} from '@angular/router';

import {
  ResourceApiService,
} from '../../../../core/resources/data-access/resource-api.service';

import {
  ResourceCatalogRequest,
} from '../../../../core/resources/models/resource-catalog-request.model';

import {
  ModerationResource,
} from '../../../../core/resources/models/moderation-resource.model';

import {
  MyResourcesSummary,
} from '../../../../core/resources/models/my-resources-summary.model';

import {
  ResourceModerationStatus,
} from '../../../../core/resources/models/resource-moderation-status.model';

import {
  ResourceSortOption,
} from '../../../../core/models/resource-sort.model';


import {
  MyResourcesQuery,
} from '../../models/my-resources-query.model';
import { DatePipe } from '@angular/common';
import { PageContainer } from '../../../../layout/page-container/page-container';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { SearchField } from '../../../../shared/ui/search-field/search-field';


const DEFAULT_QUERY: MyResourcesQuery = {
  search: '',
  moderationStatus: null,
  page: 1,
  pageSize: 12,
};


const EMPTY_SUMMARY: MyResourcesSummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};


@Component({
  selector: 'sl-my-resources',
  imports: [
    DatePipe,
    PageContainer,
    SearchField,
    Pagination,
  ],
  templateUrl: './my-resources.html',
  styleUrl: './my-resources.scss',
})
export class MyResources {

  private readonly resourceApi = inject(ResourceApiService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly router = inject(Router);


  /*
   * =========================================================
   * QUERY
   * =========================================================
   */

  readonly query = signal<MyResourcesQuery>({
      ...DEFAULT_QUERY,
    });


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

  readonly loading = signal(false);

  readonly error = signal<string | null>(null);

  readonly resources = signal<ModerationResource[]>([]);

  readonly summary = signal<MyResourcesSummary>({
      ...EMPTY_SUMMARY,
    });

  readonly totalCount = signal(0);

  readonly totalPages = signal(1);


  /*
   * =========================================================
   * DERIVED STATE
   * =========================================================
   */

  readonly selectedStatus = computed(() =>
        this.query().moderationStatus
    );

  readonly hasResources = computed(() =>
        this.resources().length > 0
    );

  readonly showPagination = computed(() =>
        !this.loading()
        && !this.error()
        && this.hasResources()
        && this.totalPages() > 1
    );

    readonly hasActiveFilter = computed(() =>
        this.query().search.trim().length > 0
        || this.query().moderationStatus !== null
    );

  /*
   * =========================================================
   * STATUS ENUM
   * Използва се и от HTML шаблона.
   * =========================================================
   */

  readonly moderationStatus = ResourceModerationStatus;


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  constructor() {
    this.loadInitialData();
  }


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  updateSearch(search: string): void {
    this.query.update(query => ({
        ...query,
        search,
        page: 1,
      })
    );

    this.loadResources();
  }


  /*
   * =========================================================
   * STATUS FILTER
   * =========================================================
   */

  updateStatus(moderationStatus: ResourceModerationStatus | null): void {
    if (this.query().moderationStatus === moderationStatus) {
      return;
    }

    this.query.update(query => ({
        ...query,
        moderationStatus,
        page: 1,
      })
    );

    this.loadResources();
  }


  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  updatePage(page: number): void {
    if (page < 1
      || page > this.totalPages()
      || page === this.query().page) {
      return;
    }

    this.query.update(query => ({
        ...query,
        page,
      })
    );

    this.loadResources();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  addResource(): void {
    void this.router.navigate(['/teacher/resources/new',]);
  }

  editResource(resourceId: string): void {
    void this.router.navigate(['/teacher/resources', resourceId,'edit', ]);
  }

  openDetails(resourceId: string): void {
    void this.router.navigate(['/teacher/resources', resourceId, ]);
  }

  /*
   * =========================================================
   * RETRY
   * =========================================================
   */

  retryLoad(): void {
    this.loadInitialData();
  }

  /*
   * =========================================================
   * INITIAL API REQUESTS
   * =========================================================
   */

  private loadInitialData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      resources:
        this.resourceApi.getMine(
          this.buildRequest()
        ),
      summary:
        this.resourceApi
          .getMineSummary(),
    })
      .pipe(
        finalize(
          () => this.loading.set(false)
        ),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({
          resources,
          summary,
        }) => {
          this.resources.set(
            resources.items
          );

          this.totalCount.set(
            resources.totalCount
          );

          this.totalPages.set(
            Math.max(resources.totalPages, 1)
          );

          this.summary.set(summary);
        },


        error: () => {
          this.resources.set([]);

          this.summary.set({
            ...EMPTY_SUMMARY,
          });

          this.totalCount.set(0);

          this.totalPages.set(1);

          this.error.set(
            'Възникна проблем при зареждането на вашите ресурси.'
          );
        },

      });
  }

  /*
   * =========================================================
   * RESOURCE LIST REQUEST
   * =========================================================
   */

  private loadResources(): void {
    this.loading.set(true);
    this.error.set(null);

    this.resourceApi
      .getMine(
        this.buildRequest()
      )
      .pipe(
        finalize(
          () => this.loading.set(false)
        ),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.resources.set(
            response.items
          );

          this.totalCount.set(
            response.totalCount
          );

          this.totalPages.set(
            Math.max(response.totalPages, 1)
          );
        },

        error: () => {

          this.resources.set([]);

          this.totalCount.set(0);

          this.totalPages.set(1);

          this.error.set(
            'Възникна проблем при зареждането на вашите ресурси.'
          );
        },

      });
  }

  /*
   * =========================================================
   * API REQUEST MODEL
   * =========================================================
   */

  private buildRequest(): ResourceCatalogRequest {
    const query = this.query();

    return {
      search:
        query.search.trim() || undefined,

      moderationStatus:
        query.moderationStatus ?? undefined,

      sort: ResourceSortOption.Newest,

      page: query.page,

      pageSize: query.pageSize,
    };
  }

  clearFilters(): void {
    this.query.set({
      ...DEFAULT_QUERY,
    });

    this.loadResources();
  }
}