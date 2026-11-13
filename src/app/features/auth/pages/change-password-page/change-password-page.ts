import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/services/auth-state.service';
import { getDefaultRouteForRoles } from '../../../../core/navigation/default-route.util';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('newPassword')?.value === control.get('confirmNewPassword')?.value
    ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'sl-change-password-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password-page.html',
  styleUrl: '../auth-password-page.scss',
})
export class ChangePasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  submit(): void {
    this.serverError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authState.changePassword(this.form.getRawValue()).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: user => void this.router.navigateByUrl(getDefaultRouteForRoles(user.roles)),
      error: (error: HttpErrorResponse) => this.serverError.set(
        error.status === 400
          ? (error.error?.message ?? 'Настоящата парола е неправилна или новата парола не отговаря на изискванията.')
          : 'Паролата не може да бъде променена. Моля, опитайте отново.'
      ),
    });
  }

  get currentPassword() { return this.form.controls.currentPassword; }
  get newPassword() { return this.form.controls.newPassword; }
  get confirmNewPassword() { return this.form.controls.confirmNewPassword; }
}
