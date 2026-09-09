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
  LucideBookmark,
  LucideBookmarkCheck,
  LucideCalendarDays,
  LucideFileText,
  LucideUserRound,
} from '@lucide/angular';

import { PageContainer } from '../../../../layout/page-container/page-container';
import { Chip } from '../../../../shared/ui/chip/chip';

import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { ResourceDetails } from '../../../../core/resources/models/resource-details.model';
import { RESOURCE_TYPE_OPTIONS, } from '../../../../core/models/resource-type.model';
import { HttpErrorResponse } from '@angular/common/http';
import { SavedResourcesApiService } from '../../../../core/resources/data-access/saved-resources-api.service';
import { AuthStateService } from '../../../../core/auth/services/auth-state.service';

@Component({
  selector: 'sl-resource-details-page',
  standalone: true,
  imports: [
    PageContainer,
    Chip,
    LucideArrowLeft,
    LucideBookOpen,
    LucideBookmark,
    LucideBookmarkCheck,
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
  private readonly authState = inject(AuthStateService);
  
  private readonly resourceApi = inject(ResourceApiService);
  private readonly savedResourcesApi = inject(SavedResourcesApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly resource = signal<ResourceDetails | null>(null);
  
  readonly coverUrl = signal<string | null>(null);

  readonly openingResource = signal(false);
  readonly openError = signal<string | null>(null);

  readonly savingResource = signal(false);
  readonly saveError = signal<string | null>(null);

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

  toggleSaved(): void {
    const resource = this.resource();

    if (!resource || this.savingResource()) {
      return;
    }

    this.savingResource.set(true);
    this.saveError.set(null);

    const request$ = resource.isSaved
      ? this.savedResourcesApi.remove(resource.id)
      : this.savedResourcesApi.save(resource.id);

    request$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () => {
          this.resource.update(current =>
            current
              ? {
                  ...current,
                  isSaved: !current.isSaved,
                }
              : current
          );

          this.savingResource.set(false);
        },

        error: () => {
          this.saveError.set(
            resource.isSaved
              ? 'Ресурсът не можа да бъде премахнат от библиотеката.'
              : 'Ресурсът не можа да бъде запазен в библиотеката.'
          );

          this.savingResource.set(false);
        },
      });
  }
}