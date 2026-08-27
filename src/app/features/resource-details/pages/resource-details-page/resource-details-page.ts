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

  readonly loading = signal(true);

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
          this.loading.set(false);
        },

        error: () => {
          this.error.set(
            'Ресурсът не беше намерен или не е достъпен.'
          );

          this.loading.set(false);
        },
      });
  }
}