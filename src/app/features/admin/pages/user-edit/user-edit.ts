import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin } from 'rxjs';

import { AdminUserDetails } from '../../../../core/admin-users/models/admin-user.models';
import { AdminUsersApiService } from '../../../../core/admin-users/services/admin-users-api.service';
import { AUTH_ROLES } from '../../../../core/auth/constants/auth-roles';
import { GradeLevelLookup, SchoolClassLookup } from '../../../../core/lookups/models/lookup.models';
import { LookupApiService } from '../../../../core/lookups/services/lookup-api.service';
import { PageContainer } from '../../../../layout/page-container/page-container';

@Component({
  selector: 'sl-user-edit',
  imports: [PageContainer, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.scss',
})
export class UserEdit {
  private readonly api = inject(AdminUsersApiService);
  private readonly lookups = inject(LookupApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<AdminUserDetails | null>(null);
  readonly grades = signal<GradeLevelLookup[]>([]);
  readonly classes = signal<SchoolClassLookup[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    fatherName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    gradeLevelId: this.fb.control<number | null>(null),
    schoolClassId: this.fb.control<string | null>(null),
  });

  constructor() {
    this.load();
    this.form.controls.gradeLevelId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.schoolClassId.setValue(null));
  }

  get isStudent(): boolean { return this.user()?.role === AUTH_ROLES.Student; }
  roleLabel(role: string): string {
    if (role === AUTH_ROLES.Admin) return 'Администратор';
    if (role === AUTH_ROLES.Teacher) return 'Учител';
    return 'Ученик';
  }
  get availableClasses(): SchoolClassLookup[] {
    const gradeId = this.form.controls.gradeLevelId.value;
    return gradeId === null ? [] : this.classes().filter(item => item.gradeLevelId === gradeId);
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); this.error.set('Липсва идентификатор на потребителя.'); return; }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ user: this.api.getUser(id), grades: this.lookups.getGradeLevels(), classes: this.lookups.getSchoolClasses() })
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ user, grades, classes }) => {
          this.user.set(user); this.grades.set(grades); this.classes.set(classes);
          this.form.patchValue({
            firstName: user.firstName, fatherName: user.fatherName, lastName: user.lastName,
            email: user.email, gradeLevelId: user.gradeLevelId, schoolClassId: user.schoolClassId,
          }, { emitEvent: false });
        },
        error: () => this.error.set('Данните за редактиране не могат да бъдат заредени.'),
      });
  }

  submit(): void {
    const user = this.user();
    if (!user || this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.serverError.set(null);
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.api.updateUser(user.id, {
      ...value,
      gradeLevelId: this.isStudent ? value.gradeLevelId : null,
      schoolClassId: this.isStudent ? value.schoolClassId : null,
    }).pipe(finalize(() => this.submitting.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => { this.toastr.success('Профилът е обновен.'); void this.router.navigate(['/admin/users', updated.id]); },
        error: (error: HttpErrorResponse) => this.serverError.set(error.error?.detail ?? 'Профилът не може да бъде обновен.'),
      });
  }
}
