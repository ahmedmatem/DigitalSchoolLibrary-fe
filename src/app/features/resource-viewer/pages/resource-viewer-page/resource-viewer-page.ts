import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  ResourceApiService,
} from '../../../catalog/data-access/resource-api.service';

import {
  PublicResourceDetailsDto,
} from '../../../resource-details/models/public-resource-details.dto';

import {
  ResourceType,
} from '../../../../core/models/resource-type.model';

@Component({
  selector: 'sl-resource-viewer-page',
  standalone: true,
  templateUrl: './resource-viewer-page.html',
  styleUrl: './resource-viewer-page.scss',
})
export class ResourceViewerPage {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly resourceApi = inject(ResourceApiService);

  private readonly destroyRef = inject(DestroyRef);

  readonly resource = signal<PublicResourceDetailsDto | null>(null);

  readonly resourceUrl = signal<string | null>(null);

  readonly loading = signal(true);

  readonly error = signal<string | null>(null);

  readonly notFound = signal(false);

  readonly unauthorized = signal(false);

  readonly ResourceType = ResourceType;

  constructor() {
    const resourceId = this.route.snapshot.paramMap.get('id');

    if (!resourceId) {
      this.error.set('Невалиден идентификатор на ресурс.');

      this.loading.set(false);

      return;
    }

    this.loadResource(resourceId);
  }

  goBack(): void {
    const resource = this.resource();

    if (resource) {
      void this.router.navigate(['/resources', resource.id, ]);

      return;
    }

    void this.router.navigate(['/catalog', ]);
  }

  private loadResource(resourceId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.unauthorized.set(false);

    this.resourceApi
      .getPublicResource(resourceId)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: resource => {
          this.resource.set(resource);

          this.loadResourceUrl(resource.id);
        },

        error: (error: HttpErrorResponse) => {
          this.loading.set(false);

          if (error.status === 404) {
            this.notFound.set(true);
            return;
          }

          this.error.set(
            'Възникна проблем при зареждането на ресурса.'
          );
        },
      });
  }

  private loadResourceUrl( resourceId: string): void {
    this.resourceApi
      .getDownloadUrl(resourceId)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: result => {
          this.resourceUrl.set(result.downloadUrl);

          this.loading.set(false);
        },

        error: (
          error: HttpErrorResponse
        ) => {
          this.loading.set(false);

          if (error.status === 401) {
            this.unauthorized.set(true);
            return;
          }

          if (error.status === 404) {
            this.notFound.set(true);
            return;
          }

          this.error.set(
            'Възникна проблем при отварянето на ресурса.'
          );
        },
      });
  }
}