import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthApiService } from '../../../../core/auth/services/auth-api.service';

@Component({
  selector: 'sl-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-page.html',
  styleUrl: '../auth-password-page.scss',
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);

  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
  });

  submit(): void {
    this.serverError.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authApi.forgotPassword(this.form.getRawValue()).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: response => this.successMessage.set(response.message),
      error: (error: HttpErrorResponse) => {
        this.serverError.set(
          error.status === 429
            ? 'Изпратени са твърде много заявки. Моля, опитайте отново по-късно.'
            : 'Заявката не може да бъде изпратена. Моля, опитайте отново.'
        );
      },
    });
  }

  get email() {
    return this.form.controls.email;
  }
}
