import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';

import { AdminUserListItem, AdminUsersQuery } from '../../../../core/admin-users/models/admin-user.models';
import { AdminUsersApiService } from '../../../../core/admin-users/services/admin-users-api.service';
import { AUTH_ROLES } from '../../../../core/auth/constants/auth-roles';
import { GradeLevelLookup, SchoolClassLookup } from '../../../../core/lookups/models/lookup.models';
import { LookupApiService } from '../../../../core/lookups/services/lookup-api.service';
import { PageContainer } from '../../../../layout/page-container/page-container';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { SearchField } from '../../../../shared/ui/search-field/search-field';

type ActiveFilter = 'all' | 'active' | 'inactive';
type SortOption = 'name' | 'name-desc' | 'email' | 'email-desc' | 'status';

@Component({
  selector: 'sl-users-list',
  imports: [PageContainer, Pagination, SearchField],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private readonly api = inject(AdminUsersApiService);
  private readonly lookups = inject(LookupApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly roles = AUTH_ROLES;
  readonly users = signal<AdminUserListItem[]>([]);
  readonly gradeLevels = signal<GradeLevelLookup[]>([]);
  readonly schoolClasses = signal<SchoolClassLookup[]>([]);
  readonly search = signal('');
  readonly role = signal('');
  readonly active = signal<ActiveFilter>('all');
  readonly gradeLevelId = signal<number | null>(null);
  readonly schoolClassId = signal('');
  readonly sort = signal<SortOption>('name');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly totalCount = signal(0);
  readonly totalPages = signal(1);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly availableClasses = computed(() => {
    const gradeId = this.gradeLevelId();
    return gradeId === null
      ? this.schoolClasses()
      : this.schoolClasses().filter(item => item.gradeLevelId === gradeId);
  });
  readonly showPagination = computed(() => !this.loading() && this.totalPages() > 1);
  readonly hasFilters = computed(() => Boolean(
    this.search() || this.role() || this.active() !== 'all' ||
    this.gradeLevelId() !== null || this.schoolClassId()
  ));

  constructor() {
    this.loadInitial();
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.reloadFromFirstPage();
  }

  updateRole(event: Event): void {
    this.role.set((event.target as HTMLSelectElement).value);
    this.reloadFromFirstPage();
  }

  updateActive(event: Event): void {
    this.active.set((event.target as HTMLSelectElement).value as ActiveFilter);
    this.reloadFromFirstPage();
  }

  updateGrade(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.gradeLevelId.set(value ? Number(value) : null);
    this.schoolClassId.set('');
    this.reloadFromFirstPage();
  }

  updateClass(event: Event): void {
    this.schoolClassId.set((event.target as HTMLSelectElement).value);
    this.reloadFromFirstPage();
  }

  updateSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as SortOption);
    this.reloadFromFirstPage();
  }

  updatePage(page: number): void {
    this.page.set(page);
    this.loadUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.search.set('');
    this.role.set('');
    this.active.set('all');
    this.gradeLevelId.set(null);
    this.schoolClassId.set('');
    this.sort.set('name');
    this.reloadFromFirstPage();
  }

  initials(user: AdminUserListItem): string {
    const names = user.fullName.trim().split(/\s+/);
    return `${names[0]?.[0] ?? ''}${names.at(-1)?.[0] ?? ''}`.toUpperCase();
  }

  roleLabel(role: string): string {
    if (role === AUTH_ROLES.Admin) return 'Администратор';
    if (role === AUTH_ROLES.Teacher) return 'Учител';
    return 'Ученик';
  }

  classLabel(user: AdminUserListItem): string {
    return user.schoolClassName ?? (user.gradeNumber ? `${user.gradeNumber}. клас` : '—');
  }

  loadInitial(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      users: this.api.getUsers(this.request()),
      grades: this.lookups.getGradeLevels(),
      classes: this.lookups.getSchoolClasses(),
    }).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ users, grades, classes }) => {
        this.applyResponse(users);
        this.gradeLevels.set(grades);
        this.schoolClasses.set(classes);
      },
      error: () => this.setLoadError(),
    });
  }

  private reloadFromFirstPage(): void {
    this.page.set(1);
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getUsers(this.request()).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => this.applyResponse(response),
      error: () => this.setLoadError(),
    });
  }

  private request(): AdminUsersQuery {
    const sort = this.sort();
    return {
      search: this.search().trim() || undefined,
      role: this.role() || undefined,
      isActive: this.active() === 'all' ? undefined : this.active() === 'active',
      gradeLevelId: this.gradeLevelId() ?? undefined,
      schoolClassId: this.schoolClassId() || undefined,
      sortBy: sort.startsWith('email') ? 'email' : sort === 'status' ? 'status' : 'name',
      sortDescending: sort.endsWith('-desc'),
      page: this.page(),
      pageSize: this.pageSize,
    };
  }

  private applyResponse(response: { items: AdminUserListItem[]; totalCount: number; totalPages: number }): void {
    this.users.set(response.items);
    this.totalCount.set(response.totalCount);
    this.totalPages.set(Math.max(response.totalPages, 1));
  }

  private setLoadError(): void {
    this.users.set([]);
    this.totalCount.set(0);
    this.totalPages.set(1);
    this.error.set('Възникна проблем при зареждането на потребителите.');
  }
}
