import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin } from 'rxjs';

import { ResourceSortOption } from '../../../../core/models/resource-sort.model';
import { RESOURCE_TYPE_OPTIONS, ResourceType } from '../../../../core/models/resource-type.model';
import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { ModerationResource } from '../../../../core/resources/models/moderation-resource.model';
import { MyResourcesSummary } from '../../../../core/resources/models/my-resources-summary.model';
import { ResourceModerationStatus } from '../../../../core/resources/models/resource-moderation-status.model';
import { PageContainer } from '../../../../layout/page-container/page-container';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { SearchField } from '../../../../shared/ui/search-field/search-field';

@Component({
  selector: 'sl-moderation-queue',
  imports: [DatePipe, PageContainer, Pagination, SearchField],
  templateUrl: './moderation-queue.html',
  styleUrl: './moderation-queue.scss',
})
export class ModerationQueue {
  private readonly api = inject(ResourceApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly status = ResourceModerationStatus;
  readonly resources = signal<ModerationResource[]>([]);
  readonly summary = signal<MyResourcesSummary>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  readonly selectedStatus = signal(ResourceModerationStatus.Pending);
  readonly search = signal('');
  readonly sort = signal(ResourceSortOption.Newest);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly processingId = signal<string | null>(null);
  readonly showPagination = computed(() => !this.loading() && this.totalPages() > 1);

  constructor() { this.loadInitial(); }

  selectStatus(status: ResourceModerationStatus): void {
    if (status === this.selectedStatus()) return;
    this.selectedStatus.set(status);
    this.page.set(1);
    this.loadResources();
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.loadResources();
  }

  updateSort(event: Event): void {
    this.sort.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
    this.loadResources();
  }

  updatePage(page: number): void {
    this.page.set(page);
    this.loadResources();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  review(id: string): void {
    void this.router.navigate(['/admin/moderation', id]);
  }

  approve(resource: ModerationResource): void {
    if (resource.moderationStatus !== this.status.Pending || this.processingId()) return;
    if (!window.confirm(`Да бъде ли одобрен ресурсът „${resource.title}“?`)) return;
    this.processingId.set(resource.id);
    this.api.approve(resource.id)
      .pipe(finalize(() => this.processingId.set(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toastr.success('Ресурсът е одобрен.'); this.loadInitial(); },
        error: () => this.toastr.error('Ресурсът не можа да бъде одобрен.'),
      });
  }

  reject(resource: ModerationResource): void {
    if (resource.moderationStatus !== this.status.Pending) return;
    void this.router.navigate(['/admin/moderation', resource.id], { fragment: 'decision' });
  }

  getTypeLabel(type: ResourceType): string {
    return RESOURCE_TYPE_OPTIONS.find(option => option.value === type)?.label ?? 'Ресурс';
  }

  getStatusLabel(status: ResourceModerationStatus): string {
    return status === this.status.Pending ? 'В изчакване'
      : status === this.status.Approved ? 'Одобрен' : 'Отхвърлен';
  }

  loadInitial(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ resources: this.api.getModeration(this.request()), summary: this.api.getModerationSummary() })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ resources, summary }) => {
          this.resources.set(resources.items);
          this.totalPages.set(Math.max(resources.totalPages, 1));
          this.summary.set(summary);
        },
        error: () => this.setLoadError(),
      });
  }

  private loadResources(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getModeration(this.request())
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => { this.resources.set(response.items); this.totalPages.set(Math.max(response.totalPages, 1)); },
        error: () => this.setLoadError(),
      });
  }

  private request() {
    return { search: this.search().trim() || undefined, moderationStatus: this.selectedStatus(), sort: this.sort(), page: this.page(), pageSize: 10 };
  }

  private setLoadError(): void {
    this.resources.set([]);
    this.error.set('Възникна проблем при зареждането на ресурсите за модерация.');
  }
}
