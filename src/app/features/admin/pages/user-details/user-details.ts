import { DatePipe } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { AdminAuditLogItem, AdminUserDetails } from '../../../../core/admin-users/models/admin-user.models';
import { AdminUsersApiService } from '../../../../core/admin-users/services/admin-users-api.service';
import { AUTH_ROLES } from '../../../../core/auth/constants/auth-roles';
import { AuthStateService } from '../../../../core/auth/services/auth-state.service';
import { passwordPolicyValidator } from '../../../../core/auth/validators/password-policy.validator';
import { PageContainer } from '../../../../layout/page-container/page-container';

@Component({
  selector: 'sl-user-details',
  imports: [DatePipe, PageContainer, ReactiveFormsModule, RouterLink],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss',
})
export class UserDetails {
  private readonly api = inject(AdminUsersApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<AdminUserDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly dialog = signal<'promote' | 'deactivate' | 'reactivate' | 'reset' | null>(null);
  readonly processing = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly deactivateForm = this.fb.nonNullable.group({
    reason: ['', Validators.maxLength(500)],
  });
  readonly resetForm = this.fb.nonNullable.group({
    temporaryPassword: ['', [Validators.required, Validators.minLength(6), passwordPolicyValidator]],
  });

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

  canEdit(user: AdminUserDetails): boolean {
    return user.role !== AUTH_ROLES.Admin || user.id === this.authState.currentUser()?.id;
  }

  canResetPassword(user: AdminUserDetails): boolean {
    return user.role !== AUTH_ROLES.Admin || user.id === this.authState.currentUser()?.id;
  }

  canDeactivate(user: AdminUserDetails): boolean {
    return user.isActive && user.role !== AUTH_ROLES.Admin && user.id !== this.authState.currentUser()?.id;
  }

  openDialog(type: 'promote' | 'deactivate' | 'reactivate' | 'reset'): void {
    this.actionError.set(null);
    this.deactivateForm.reset();
    this.resetForm.reset();
    this.dialog.set(type);
  }

  closeDialog(): void {
    if (!this.processing()) this.dialog.set(null);
  }

  confirmAction(): void {
    const user = this.user();
    const dialog = this.dialog();
    if (!user || !dialog || this.processing()) return;
    if (dialog === 'deactivate' && this.deactivateForm.invalid) return;
    if (dialog === 'reset' && this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const request = dialog === 'promote' ? this.api.promoteToTeacher(user.id)
      : dialog === 'deactivate' ? this.api.deactivate(user.id, { reason: this.deactivateForm.controls.reason.value.trim() || null })
      : dialog === 'reactivate' ? this.api.reactivate(user.id)
      : this.api.resetPassword(user.id, this.resetForm.getRawValue());

    this.processing.set(true);
    this.actionError.set(null);
    request.pipe(
      finalize(() => this.processing.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        const messages = {
          promote: 'Потребителят е повишен до учител.',
          deactivate: 'Профилът е деактивиран.',
          reactivate: 'Профилът е активиран.',
          reset: 'Временната парола е зададена.',
        };
        this.toastr.success(messages[dialog]);
        this.dialog.set(null);
        this.load();
      },
      error: (error: HttpErrorResponse) => this.actionError.set(error.error?.detail ?? 'Действието не може да бъде изпълнено.'),
    });
  }

  dialogTitle(): string {
    return this.dialog() === 'promote' ? 'Повишаване до учител'
      : this.dialog() === 'deactivate' ? 'Деактивиране на профил'
      : this.dialog() === 'reactivate' ? 'Активиране на профил'
      : 'Задаване на временна парола';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeDialog(); }
}
