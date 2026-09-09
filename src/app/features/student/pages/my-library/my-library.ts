import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';

import { SavedResourcesApiService } from '../../../../core/resources/data-access/saved-resources-api.service';

import { ResourceCatalogRequest } from '../../../../core/resources/models/resource-catalog-request.model';

import { ResourceSortOption } from '../../../../core/models/resource-sort.model';

import { PageContainer } from '../../../../layout/page-container/page-container';

import { SearchField } from '../../../../shared/ui/search-field/search-field';

import { ResourceCard } from '../../../../shared/ui/resource-card/resource-card';

import { ResourceCardVm } from '../../../../shared/ui/resource-card/resource-card.model';

import { mapResourceToCard } from '../../../../shared/ui/resource-card/resource.mapper';

import { Pagination } from '../../../../shared/ui/pagination/pagination';


interface MyLibraryQuery {
  search: string;
  page: number;
  pageSize: number;
}


const DEFAULT_QUERY: MyLibraryQuery = {
  search: '',
  page: 1,
  pageSize: 12,
};


@Component({
  selector: 'sl-my-library',
  imports: [
    PageContainer,
    SearchField,
    ResourceCard,
    Pagination,
  ],
  templateUrl: './my-library.html',
  styleUrl: './my-library.scss',
})
export class MyLibrary {

  private readonly savedResourcesApi = inject(SavedResourcesApiService);

  private readonly resourceApi = inject(ResourceApiService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly router = inject(Router);


  /*
   * =========================================================
   * QUERY
   * =========================================================
   */

  readonly query = signal<MyLibraryQuery>({ ...DEFAULT_QUERY });


  /*
   * =========================================================
   * PAGE STATE
   * =========================================================
   */

  readonly loading = signal(false);

  readonly error = signal<string | null>(null);

  readonly resources = signal<ResourceCardVm[]>([]);

  readonly totalCount = signal(0);

  readonly totalPages = signal(1);


  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  constructor() {
    this.loadResources();
  }


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  updateSearch(search: string): void {

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
   * PAGINATION
   * =========================================================
   */

  updatePage(page: number): void {

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
   * RESOURCE ACTIONS
   * =========================================================
   */

  openResource(id: string): void {
    void this.router.navigate(['/resources', id]);
  }


  removeSavedResource(resourceId: string): void {

    this.savedResourcesApi
      .remove(resourceId)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: () => {

          this.resources.update(
            resources =>
              resources.filter(
                resource => resource.id !== resourceId
              )
          );

          this.totalCount.update(
            count => Math.max(0, count - 1)
          );


          /*
           * Ако след изтриване текущата
           * страница остане празна,
           * презареждаме резултатите.
           */

          if (this.resources().length === 0 
            && this.query().page > 1
          ) {

            this.query.update(
              query => ({
                ...query,
                page: query.page - 1,
              })
            );

            this.loadResources();
          }

        },

        error: () => {

          this.error.set(
            'Ресурсът не можа да бъде премахнат от библиотеката.'
          );

        },

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


    this.savedResourcesApi
      .getMine( this.buildRequest())
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: response => {

          const resources = response.items.map(
              resource => ({
                ...mapResourceToCard(
                  resource
                ),
                isSaved: true,
              })
            );


          this.resources.set(resources);


          this.loadCoverUrls(resources);


          this.totalCount.set(response.totalCount);

          this.totalPages.set(response.totalPages);

          this.loading.set(false);
        },


        error: () => {

          this.resources.set([]);

          this.error.set(
            'Възникна проблем при зареждането на запазените ресурси.'
          );

          this.loading.set(false);
        },

      });
  }


  /*
   * =========================================================
   * COVER IMAGES
   * =========================================================
   */

  private loadCoverUrls(resources: ResourceCardVm[]): void {

    for (const resource of resources) {

      if (!resource.hasCover) { continue; }


      this.resourceApi
        .getPublicCover(resource.id)
        .pipe(
          takeUntilDestroyed(
            this.destroyRef
          )
        )
        .subscribe({

          next: cover => {

            this.resources.update(
              items =>
                items.map(
                  item =>
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
            // Placeholder при проблем с cover.
          },

        });
    }
  }


  /*
   * =========================================================
   * REQUEST
   * =========================================================
   */

  private buildRequest(): ResourceCatalogRequest {

    const query = this.query();


    return {
      search: query.search.trim() || undefined,

      sort: ResourceSortOption.Newest,

      page: query.page,

      pageSize: query.pageSize,
    };
  }
}