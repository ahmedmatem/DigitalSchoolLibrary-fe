import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  LucideArrowLeft,
  LucideBookOpen,
  LucideCalendarDays,
  LucideFileText,
  LucideUserRound,
} from '@lucide/angular';

import { PageContainer } from '../../../../layout/page-container/page-container';
import { Chip } from '../../../../shared/ui/chip/chip';

import { ResourceApiService } from '../../../catalog/data-access/resource-api.service';
import { PublicResourceDetailsDto } from '../../models/public-resource-details.dto';
import { RESOURCE_TYPE_OPTIONS, } from '../../../../core/models/resource-type.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'sl-resource-details-page',
  standalone: true,
  imports: [
    PageContainer,
    Chip,
    LucideArrowLeft,
    LucideBookOpen,
    LucideCalendarDays,
    LucideFileText,
    LucideUserRound,
  ],
  templateUrl: './resource-details-page.html',
  styleUrl: './resource-details-page.scss',
})
export class ResourceDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly resourceApi = inject(ResourceApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resource = signal<PublicResourceDetailsDto | null>(null);
  
  readonly coverUrl = signal<string | null>(null);

  readonly openingResource = signal(false);
  readonly openError = signal<string | null>(null);

  readonly loading = signal(true);
  readonly notFound = signal(false);

  readonly error = signal<string | null>(null);

  constructor() {
    const resourceId = this.route.snapshot.paramMap.get('id');

    if (!resourceId) {
      this.error.set('Невалиден идентификатор на ресурс.');
      this.loading.set(false);
      return;
    }

    this.loadResource(resourceId);
  }

  getResourceTypeLabel(type: number): string {
    return (
      RESOURCE_TYPE_OPTIONS.find(
        item => item.value === type
      )?.label ?? 'Друго'
    );
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat(
      'bg-BG',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ).format(new Date(value));
  }

  goBack(): void {
    void this.router.navigate(['/catalog']);
  }

  private loadResource(resourceId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);

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

          if (resource.hasCover) {
            this.loadCover(resource.id);
          }

          this.loading.set(false);
        },

        error: (error: HttpErrorResponse) => {
          this.loading.set(false);

          if (error.status === 404) {
            this.notFound.set(true);
            this.error.set(null);
            return;
          }

          this.error.set(
            'Възникна проблем при зареждането на ресурса.'
          );
        },
      });
  }

  retryLoad(): void {
    const resourceId = this.route.snapshot.paramMap.get('id');

    if (!resourceId) return;

    this.loadResource(resourceId);
  }

  private loadCover(resourceId: string): void {
    this.resourceApi
      .getPublicCover(resourceId)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: cover => {
          this.coverUrl.set(
            cover.downloadUrl
          );
        },

        error: () => {
          this.coverUrl.set(null);
        },
      });
  }

  openResource(): void {
    const resource = this.resource();

    if (!resource) return;

    void this.router.navigate([
      '/resources',
      resource.id,
      'view',
    ]);
  }
}