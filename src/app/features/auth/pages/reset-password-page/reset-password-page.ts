import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthApiService } from '../../../../core/auth/services/auth-api.service';
import { passwordPolicyValidator } from '../../../../core/auth/validators/password-policy.validator';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('newPassword')?.value === control.get('confirmNewPassword')?.value
    ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'sl-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-page.html',
  styleUrl: '../auth-password-page.scss',
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);

  private readonly email = this.route.snapshot.queryParamMap.get('email');
  private readonly token = this.route.snapshot.queryParamMap.get('token');
  readonly invalidLink = !this.email || !this.token;
  readonly submitting = signal(false);
  readonly succeeded = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), passwordPolicyValidator]],
    confirmNewPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  submit(): void {
    this.serverError.set(null);
    if (this.invalidLink || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authApi.resetPassword({
      email: this.email!,
      token: this.token!,
      ...this.form.getRawValue(),
    }).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => this.succeeded.set(true),
      error: (error: HttpErrorResponse) => this.serverError.set(
        error.status === 400
          ? (error.error?.detail ?? 'Линкът за възстановяване е невалиден или е изтекъл.')
          : 'Паролата не може да бъде променена. Моля, опитайте отново.'
      ),
    });
  }

  get newPassword() { return this.form.controls.newPassword; }
  get confirmNewPassword() { return this.form.controls.confirmNewPassword; }
}
