import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminAuditLogItem, AdminUserDetails } from '../../../../core/admin-users/models/admin-user.models';
import { AdminUsersApiService } from '../../../../core/admin-users/services/admin-users-api.service';
import { AUTH_ROLES } from '../../../../core/auth/constants/auth-roles';
import { PageContainer } from '../../../../layout/page-container/page-container';

@Component({
  selector: 'sl-user-details',
  imports: [DatePipe, PageContainer, RouterLink],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss',
})
export class UserDetails {
  private readonly api = inject(AdminUsersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<AdminUserDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.error.set('Липсва идентификатор на потребителя.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.api.getUser(id).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: user => this.user.set(user),
      error: () => {
        this.user.set(null);
        this.error.set('Потребителят не може да бъде зареден.');
      },
    });
  }

  initials(user: AdminUserDetails): string {
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  }

  roleLabel(role: string): string {
    if (role === AUTH_ROLES.Admin) return 'Администратор';
    if (role === AUTH_ROLES.Teacher) return 'Учител';
    return 'Ученик';
  }

  classLabel(user: AdminUserDetails): string {
    return user.schoolClassName ?? (user.gradeNumber ? `${user.gradeNumber}. клас` : 'Не е приложимо');
  }

  auditLabel(item: AdminAuditLogItem): string {
    const labels: Record<string, string> = {
      UpdateUserProfile: 'Редактиран профил',
      PromoteToTeacher: 'Повишен до учител',
      DeactivateUser: 'Деактивиран профил',
      ReactivateUser: 'Активиран профил',
      ResetPassword: 'Зададена временна парола',
    };
    return labels[item.action] ?? item.action;
  }
}
