import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { AuthStateService } from '../../../../core/auth/services/auth-state.service';

@Component({
  selector: 'sl-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(256),
      ],
    ],

    password: [
      '',
      [
        Validators.required,
      ],
    ],

    rememberMe: false,
  });

  submit(): void {
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.authState
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.submitting.set(false);
        })
      )
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          void this.router.navigateByUrl(returnUrl || '/');
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.serverError.set(
              error.error?.message ??
                'Невалиден имейл или парола.'
            );

            return;
          }

          this.serverError.set(
            'Неуспешен вход. Моля, опитайте отново.'
          );
        },
      });
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }
}