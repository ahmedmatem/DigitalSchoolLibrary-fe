import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { RESOURCE_TYPE_OPTIONS, ResourceType } from '../../../../core/models/resource-type.model';
import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { ManagementResourceDetails } from '../../../../core/resources/models/management-resource-details.model';
import { ResourceAudienceType } from '../../../../core/resources/models/resource-audience-type.model';
import { ResourceModerationStatus } from '../../../../core/resources/models/resource-moderation-status.model';
import { PageContainer } from '../../../../layout/page-container/page-container';

@Component({
  selector: 'sl-moderation-review',
  imports: [DatePipe, DecimalPipe, FormsModule, PageContainer],
  templateUrl: './moderation-review.html',
  styleUrl: './moderation-review.scss',
})
export class ModerationReview {
  private readonly api = inject(ResourceApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly status = ResourceModerationStatus;
  readonly type = ResourceType;
  readonly resource = signal<ManagementResourceDetails | null>(null);
  readonly coverUrl = signal<string | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly rejectionReason = signal('');
  readonly decisionError = signal<string | null>(null);
  readonly processing = signal(false);
  readonly opening = signal(false);\n  readonly downloading = signal(false);
  readonly pending = computed(() => this.resource()?.moderationStatus === this.status.Pending);

  constructor() { this.load(); }

  goBack(): void { void this.router.navigate(['/admin/moderation']); }

  getTypeLabel(type: ResourceType): string {
    return RESOURCE_TYPE_OPTIONS.find(option => option.value === type)?.label ?? 'Друго';
  }

  getAudienceLabel(resource: ManagementResourceDetails): string {
    if (resource.audienceType === ResourceAudienceType.AllStudents) return 'Всички ученици';
    if (resource.audienceType === ResourceAudienceType.GradeLevels) return resource.gradeLevelIds.map(x => `${x}. клас`).join(', ') || 'Избрани класове';
    return resource.schoolClassIds.length === 1 ? '1 избрана паралелка' : `${resource.schoolClassIds.length} избрани паралелки`;
  }

  openResource(): void {
    const item = this.resource();
    if (!item || this.opening()) return;
    if (item.type === this.type.ExternalLink && item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!item.fileStorageKey) return;
    this.opening.set(true);
    this.api.getModerationPreview(item.id)
      .pipe(finalize(() => this.opening.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: result => window.open(result.downloadUrl, '_blank', 'noopener,noreferrer'), error: () => this.toastr.error('Файлът не можа да бъде отворен.') });
  }

  downloadResource(): void {
    const item = this.resource();
    if (!item?.fileStorageKey || this.downloading()) return;
    this.downloading.set(true);
    this.api.getModerationDownload(item.id)
      .pipe(finalize(() => this.downloading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: result => window.open(result.downloadUrl, '_blank', 'noopener,noreferrer'), error: () => this.toastr.error('Файлът не можа да бъде свален.') });
  }

  approve(): void {
    const item = this.resource();
    if (!item || !this.pending() || this.processing()) return;
    this.processing.set(true); this.decisionError.set(null);
    this.api.approve(item.id)
      .pipe(finalize(() => this.processing.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.finish('Ресурсът е одобрен.'), error: () => this.decisionError.set('Ресурсът не можа да бъде одобрен.') });
  }

  reject(): void {
    const item = this.resource();
    const reason = this.rejectionReason().trim();
    if (!item || !this.pending() || this.processing()) return;
    if (reason.length < 5) { this.decisionError.set('Въведете причина с поне 5 символа.'); return; }
    this.processing.set(true); this.decisionError.set(null);
    this.api.reject(item.id, reason)
      .pipe(finalize(() => this.processing.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.finish('Ресурсът е отхвърлен.'), error: error => this.decisionError.set(this.validationMessage(error)) });
  }

  private finish(message: string): void { this.toastr.success(message); void this.router.navigate(['/admin/moderation']); }

  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); this.notFound.set(true); return; }
    this.api.getManagementResource(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: resource => { this.resource.set(resource); this.loading.set(false); if (resource.coverStorageKey) this.loadCover(resource.id); },
      error: (error: HttpErrorResponse) => { this.loading.set(false); error.status === 404 ? this.notFound.set(true) : this.error.set('Възникна проблем при зареждането на ресурса.'); },
    });
  }

  private loadCover(id: string): void {
    this.api.getManagementCover(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: result => this.coverUrl.set(result.downloadUrl), error: () => this.coverUrl.set(null) });
  }

  private validationMessage(error: HttpErrorResponse): string {
    const errors = error.error?.errors as Record<string, string[]> | undefined;
    return errors ? Object.values(errors).flat()[0] ?? 'Ресурсът не можа да бъде отхвърлен.' : 'Ресурсът не можа да бъде отхвърлен.';
  }
}
