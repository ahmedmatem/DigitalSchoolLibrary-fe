import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import {
  LucideArrowLeft,
  LucideExternalLink,
  LucideFileText,
  LucidePencil,
} from '@lucide/angular';

import { PageContainer } from '../../../../layout/page-container/page-container';
import { AUTH_ROLES } from '../../../../core/auth/constants/auth-roles';
import { AuthStateService } from '../../../../core/auth/services/auth-state.service';
import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { ManagementResourceDetails } from '../../../../core/resources/models/management-resource-details.model';
import { ResourceModerationStatus } from '../../../../core/resources/models/resource-moderation-status.model';
import { ResourceAudienceType } from '../../../../core/resources/models/resource-audience-type.model';
import {
  RESOURCE_TYPE_OPTIONS,
  ResourceType,
} from '../../../../core/models/resource-type.model';

@Component({
  selector: 'sl-teacher-resource-details',
  imports: [
    DatePipe,
    DecimalPipe,
    PageContainer,
    LucideArrowLeft,
    LucideExternalLink,
    LucideFileText,
    LucidePencil,
  ],
  templateUrl: './resource-details.html',
  styleUrl: './resource-details.scss',
})
export class TeacherResourceDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly resourceApi = inject(ResourceApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resource = signal<ManagementResourceDetails | null>(null);
  readonly coverUrl = signal<string | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly openingResource = signal(false);
  readonly openError = signal<string | null>(null);

  readonly moderationStatus = ResourceModerationStatus;
  readonly resourceType = ResourceType;

  readonly canEdit = computed(() => {
    const resource = this.resource();

    return !!resource && (
      this.authState.hasRole(AUTH_ROLES.Admin)
      || resource.moderationStatus === ResourceModerationStatus.Pending
      || resource.moderationStatus === ResourceModerationStatus.Rejected
    );
  });

  readonly canOpen = computed(() => {
    const resource = this.resource();

    return !!resource && (
      resource.type === ResourceType.ExternalLink
        ? !!resource.externalUrl
        : !!resource.fileStorageKey
    );
  });

  constructor() {
    this.loadResource();
  }

  getResourceTypeLabel(type: ResourceType): string {
    return RESOURCE_TYPE_OPTIONS.find(option => option.value === type)?.label
      ?? 'Друго';
  }

  getStatusLabel(status: ResourceModerationStatus): string {
    switch (status) {
      case ResourceModerationStatus.Pending:
        return 'В изчакване';
      case ResourceModerationStatus.Approved:
        return 'Одобрен';
      case ResourceModerationStatus.Rejected:
        return 'Отхвърлен';
    }
  }

  getAudienceLabel(resource: ManagementResourceDetails): string {
    switch (resource.audienceType) {
      case ResourceAudienceType.AllStudents:
        return 'Всички ученици';
      case ResourceAudienceType.GradeLevels:
        return resource.gradeLevelIds.length
          ? resource.gradeLevelIds
              .slice()
              .sort((a, b) => a - b)
              .map(grade => `${grade}. клас`)
              .join(', ')
          : 'Избрани класове';
      case ResourceAudienceType.SchoolClasses:
        return resource.schoolClassIds.length === 1
          ? '1 избрана паралелка'
          : `${resource.schoolClassIds.length} избрани паралелки`;
    }
  }

  goBack(): void {
    void this.router.navigate(['/teacher']);
  }

  editResource(): void {
    const id = this.resource()?.id;

    if (id) {
      void this.router.navigate(['/teacher/resources', id, 'edit']);
    }
  }

  openResource(): void {
    const resource = this.resource();

    if (!resource || !this.canOpen() || this.openingResource()) {
      return;
    }

    this.openingResource.set(true);
    this.openError.set(null);

    this.resourceApi
      .getManagementOpen(resource.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.openingResource.set(false);
          window.location.assign(result.url);
        },
        error: () => {
          this.openingResource.set(false);
          this.openError.set(
            'Ресурсът не можа да бъде отворен. Моля, опитайте отново.'
          );
        },
      });
  }

  retryLoad(): void {
    this.loadResource();
  }

  private loadResource(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.loading.set(true);
    this.notFound.set(false);
    this.error.set(null);
    this.coverUrl.set(null);

    this.resourceApi
      .getManagementResource(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: resource => {
          this.resource.set(resource);
          this.loading.set(false);

          if (resource.coverStorageKey) {
            this.loadManagementCover(resource.id);
          }
        },
        error: (httpError: HttpErrorResponse) => {
          this.loading.set(false);
          this.resource.set(null);

          if (httpError.status === 404) {
            this.notFound.set(true);
            return;
          }

          this.error.set(
            'Възникна проблем при зареждането на ресурса.'
          );
        },
      });
  }

  private loadManagementCover(id: string): void {
    this.resourceApi
      .getManagementCover(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => this.coverUrl.set(result.downloadUrl),
        error: () => this.coverUrl.set(null),
      });
  }
}
