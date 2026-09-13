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
import { Observable } from 'rxjs';

import {
  ResourceApiService,
} from '../../../../core/resources/data-access/resource-api.service';

import {
  ResourceDetails,
} from '../../../../core/resources/models/resource-details.model';
import { ManagementResourceDetails } from '../../../../core/resources/models/management-resource-details.model';

import {
  RESOURCE_TYPE_OPTIONS,
  ResourceType,
} from '../../../../core/models/resource-type.model';

import { PdfViewer } from '../../components/pdf-viewer/pdf-viewer';
import { VideoViewer } from '../../components/video-viewer/video-viewer';
import { GenericViewer } from '../../components/generic-viewer/generic-viewer';
import { ExternalLinkViewer } from '../../components/external-link-viewer/external-link-viewer';
import { Button } from '../../../../shared/ui/button/button';

type ViewerResource = ResourceDetails | ManagementResourceDetails;

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

  readonly viewerMode =
    this.route.snapshot.data['viewerMode'] as 'management' | 'admin' | undefined;

  readonly managementMode = !!this.viewerMode;

  readonly adminMode = this.viewerMode === 'admin';

  readonly resource = signal<ViewerResource | null>(null);

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
      void this.router.navigate(
        this.adminMode
          ? ['/admin/moderation', resource.id]
          : this.managementMode
            ? ['/teacher/resources', resource.id]
            : ['/resources', resource.id]
      );

      return;
    }

    void this.router.navigate(
      this.adminMode
        ? ['/admin/moderation']
        : this.managementMode
          ? ['/teacher']
          : ['/catalog']
    );
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

    const returnUrl = this.adminMode
      ? `/admin/moderation/${resource.id}/view`
      : this.managementMode
        ? `/teacher/resources/${resource.id}/view`
        : `/resources/${resource.id}/view`;

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

    const resourceRequest: Observable<ViewerResource> = this.managementMode
      ? this.resourceApi.getManagementResource(resourceId)
      : this.resourceApi.getPublicResource(resourceId);

    resourceRequest
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
    const openRequest = this.managementMode
      ? this.resourceApi.getManagementOpen(resourceId)
      : this.resourceApi.getOpenUrl(resourceId);

    openRequest
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
