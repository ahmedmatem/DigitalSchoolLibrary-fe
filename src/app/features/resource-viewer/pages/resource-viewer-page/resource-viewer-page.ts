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
  RESOURCE_TYPE_OPTIONS,
  ResourceType,
} from '../../../../core/models/resource-type.model';

import { PdfViewer } from '../../components/pdf-viewer/pdf-viewer';
import { VideoViewer } from '../../components/video-viewer/video-viewer';
import { GenericViewer } from '../../components/generic-viewer/generic-viewer';
import { ExternalLinkViewer } from '../../components/external-link-viewer/external-link-viewer';
import { Button } from '../../../../shared/ui/button/button';
import { LucideLockKeyhole, LucideLogIn, LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'sl-resource-viewer-page',
  standalone: true,
  imports: [
    PdfViewer, 
    VideoViewer, 
    GenericViewer, 
    ExternalLinkViewer,
    Button,],
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

  retry(): void {
    const resourceId = this.route.snapshot.paramMap.get('id');

    if (!resourceId) {
      return;
    }

    this.resource.set(null);
    this.resourceUrl.set(null);

    this.error.set(null);
    this.notFound.set(false);
    this.unauthorized.set(false);

    this.loadResource(resourceId);
  }

  getResourceTypeLabel(type: ResourceType): string {
    return (
      RESOURCE_TYPE_OPTIONS.find(
        item => item.value === type
      )?.label ?? 'Ресурс'
    );
  }

  goToLogin(): void {
    const resource = this.resource();

    if (!resource) {
      void this.router.navigate([
        '/login',
      ]);

      return;
    }

    const returnUrl = `/resources/${resource.id}/view`;

    void this.router.navigate(
      ['/login'],
      {
        queryParams: {returnUrl, },
      }
    );
  }

  goHome(): void {
    void this.router.navigate(['/',]);
  }

  goToCatalog(): void {
    void this.router.navigate(['/catalog',]);
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

  private loadResourceUrl(resourceId: string): void {
    this.resourceApi
      .getOpenUrl(resourceId)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: result => {
          this.resourceUrl.set(
            result.url
          );

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

          if (error.status === 403) {
            this.error.set(
              'Нямате достъп до този ресурс.'
            );
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