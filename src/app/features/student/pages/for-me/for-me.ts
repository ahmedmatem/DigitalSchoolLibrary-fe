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

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  AuthStateService,
} from '../../../../core/auth/services/auth-state.service';

import {
  ResourceApiService,
} from '../../../../core/resources/data-access/resource-api.service';

import {
  ResourceCatalogRequest,
} from '../../../../core/resources/models/resource-catalog-request.model';

import {
  LookupApiService,
} from '../../../../core/lookups/services/lookup-api.service';

import {
  SubjectLookup,
  CategoryLookup,
  GradeLevelLookup,
} from '../../../../core/lookups/models/lookup.models';

import {
  RESOURCE_TYPE_OPTIONS,
} from '../../../../core/models/resource-type.model';

import {
  ResourceSortOption,
} from '../../../../core/models/resource-sort.model';

import {
  PageContainer,
} from '../../../../layout/page-container/page-container';

import {
  SearchField,
} from '../../../../shared/ui/search-field/search-field';

import {
  CatalogFilters,
} from '../../../../shared/ui/catalog-filters/catalog-filters';


interface ForMeQuery {
  search: string;

  subjectId: string | null;

  categoryId: string | null;

  gradeLevelId: number | null;

  resourceType: number | null;

  page: number;

  pageSize: number;
}


const DEFAULT_QUERY: ForMeQuery = {
  search: '',

  subjectId: null,

  categoryId: null,

  gradeLevelId: null,

  resourceType: null,

  page: 1,

  pageSize: 12,
};


@Component({
  selector: 'sl-for-me',

  imports: [
    PageContainer,
    SearchField,
    CatalogFilters,
  ],

  templateUrl: './for-me.html',
  styleUrl: './for-me.scss',
})
export class ForMe {

  private readonly authState =
    inject(AuthStateService);

  private readonly resourceApi =
    inject(ResourceApiService);

  private readonly lookupApi =
    inject(LookupApiService);

  private readonly destroyRef =
    inject(DestroyRef);


  /*
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  readonly user =
    this.authState.currentUser;


  readonly gradeLabel =
    computed(() => {

      const grade =
        this.user()?.gradeNumber;

      if (!grade) {
        return null;
      }

      return `${grade}. клас`;
    });


  readonly classLabel =
    computed(() => {

      const className =
        this.user()?.schoolClassName;

      if (!className) {
        return null;
      }

      return `${className} паралелка`;
    });


  /*
   * =========================================================
   * QUERY
   * =========================================================
   */

  readonly query =
    signal<ForMeQuery>({
      ...DEFAULT_QUERY,
    });


  /*
   * =========================================================
   * LOOKUPS
   * =========================================================
   */

  readonly subjects =
    signal<SubjectLookup[]>([]);

  readonly categories =
    signal<CategoryLookup[]>([]);

  readonly gradeLevels =
    signal<GradeLevelLookup[]>([]);

  readonly resourceTypes =
    RESOURCE_TYPE_OPTIONS;


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly totalCount =
    signal(0);

  readonly totalPages =
    signal(1);


  /*
   * =========================================================
   * ACTIVE FILTERS
   * =========================================================
   */

  readonly activeFilters =
    computed<string[]>(() => {

      const query =
        this.query();

      const filters: string[] =
        [];


      if (query.subjectId) {

        const subject =
          this.subjects()
            .find(
              item =>
                item.id === query.subjectId
            );

        if (subject) {
          filters.push(
            subject.name
          );
        }
      }


      if (query.categoryId) {

        const category =
          this.categories()
            .find(
              item =>
                item.id === query.categoryId
            );

        if (category) {
          filters.push(
            category.name
          );
        }
      }


      if (
        query.gradeLevelId !== null
      ) {

        const grade =
          this.gradeLevels()
            .find(
              item =>
                item.id === query.gradeLevelId
            );

        if (grade) {
          filters.push(
            grade.displayName
          );
        }
      }


      if (
        query.resourceType !== null
      ) {

        const type =
          this.resourceTypes
            .find(
              item =>
                item.value ===
                query.resourceType
            );

        if (type) {
          filters.push(
            type.label
          );
        }
      }


      return filters;
    });


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  constructor() {

    forkJoin({
      subjects:
        this.lookupApi.getSubjects(),

      categories:
        this.lookupApi.getCategories(),

      grades:
        this.lookupApi.getGradeLevels(),
    })
      .pipe(

        tap(({
          subjects,
          categories,
          grades,
        }) => {

          this.subjects.set(
            subjects
          );

          this.categories.set(
            categories
          );

          this.gradeLevels.set(
            grades
          );


          this.loading.set(true);

          this.error.set(null);
        }),


        switchMap(() =>
          this.resourceApi
            .getForMe(
              this.buildRequest()
            )
        ),


        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: response => {

          this.totalCount.set(
            response.totalCount
          );

          this.totalPages.set(
            response.totalPages
          );

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


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  updateSearch(
    search: string
  ): void {

    this.query.update(
      query => ({
        ...query,

        search,

        page: 1,
      })
    );


    this.loadResources();
  }


  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */

  updateSubjectById(
    subjectId: string | null
  ): void {

    this.query.update(
      query => ({
        ...query,

        subjectId,

        page: 1,
      })
    );


    this.loadResources();
  }


  updateCategoryById(
    categoryId: string | null
  ): void {

    this.query.update(
      query => ({
        ...query,

        categoryId,

        page: 1,
      })
    );


    this.loadResources();
  }


  updateGradeById(
    gradeLevelId: number | null
  ): void {

    this.query.update(
      query => ({
        ...query,

        gradeLevelId,

        page: 1,
      })
    );


    this.loadResources();
  }


  updateResourceTypeByValue(
    resourceType: number | null
  ): void {

    this.query.update(
      query => ({
        ...query,

        resourceType,

        page: 1,
      })
    );


    this.loadResources();
  }


  clearFilters(): void {

    this.query.update(
      query => ({
        ...query,

        subjectId: null,

        categoryId: null,

        gradeLevelId: null,

        resourceType: null,

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

  updatePage(
    page: number
  ): void {

    this.query.update(
      query => ({
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
   * RETRY
   * =========================================================
   */

  retryLoad(): void {

    this.loadResources();
  }


  /*
   * =========================================================
   * API
   * =========================================================
   */

  private loadResources(): void {

    this.loading.set(true);

    this.error.set(null);


    this.resourceApi
      .getForMe(
        this.buildRequest()
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: response => {

          this.totalCount.set(
            response.totalCount
          );

          this.totalPages.set(
            response.totalPages
          );

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


  private buildRequest():
    ResourceCatalogRequest {

    const query =
      this.query();


    return {
      search:
        query.search.trim()
          || undefined,

      subjectId:
        query.subjectId
          ?? undefined,

      categoryId:
        query.categoryId
          ?? undefined,

      gradeLevelId:
        query.gradeLevelId
          ?? undefined,

      type:
        query.resourceType
          ?? undefined,

      sort:
        ResourceSortOption.Newest,

      page:
        query.page,

      pageSize:
        query.pageSize,
    };
  }
}