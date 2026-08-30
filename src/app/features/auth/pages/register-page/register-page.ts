import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import {
  finalize,
} from 'rxjs';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  AuthStateService,
} from '../../../../core/auth/services/auth-state.service';

import {
  LookupApiService,
} from '../../../../core/lookups/services/lookup-api.service';

import {
  GradeLevelLookup,
  SchoolClassLookup,
} from '../../../../core/lookups/models/lookup.models';


const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};


@Component({
  selector: 'sl-register-page',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],

  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {

  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthStateService);
  private readonly lookupApi = inject(LookupApiService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);


  readonly submitting = signal(false);

  readonly loadingGradeLevels = signal(false);
  readonly loadingSchoolClasses = signal(false);

  readonly lookupError = signal<string | null>(null);
  readonly serverError = signal<string | null>(null);

  readonly gradeLevels = signal<GradeLevelLookup[]>([]);
  readonly schoolClasses = signal<SchoolClassLookup[]>([]);


  readonly form = this.fb.group(
    {
      firstName: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ]
      ),

      fatherName: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ]
      ),

      lastName: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ]
      ),

      email: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(256),
        ]
      ),

      password: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),

          Validators.pattern(/^(?=.*[a-z])(?=.*\d).+$/),
        ]
      ),

      confirmPassword: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
        ]
      ),

      gradeLevelId: this.fb.control<number | null>(null),

      schoolClassId: this.fb.control<string | null>({
        value: null,
        disabled: true,
      }),
    },
    {
      validators: [
        passwordsMatchValidator,
      ],
    }
  );


  constructor() {

    this.loadGradeLevels();

    this.form.controls.gradeLevelId.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(gradeLevelId => {

        this.onGradeLevelChanged(gradeLevelId);
      });
  }


  submit(): void {

    this.serverError.set(null);

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    this.submitting.set(true);

    const raw = this.form.getRawValue();


    this.authState
      .register({
        firstName: raw.firstName.trim(),
        fatherName: raw.fatherName.trim(),
        lastName: raw.lastName.trim(),
        email: raw.email.trim(),

        password: raw.password,
        confirmPassword: raw.confirmPassword,

        gradeLevelId: raw.gradeLevelId,
        schoolClassId: raw.schoolClassId,
      })
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

          this.serverError.set(
            this.getRegistrationError(error)
          );
        },
      });
  }


  private loadGradeLevels(): void {

    this.loadingGradeLevels.set(true);
    this.lookupError.set(null);


    this.lookupApi
      .getGradeLevels()
      .pipe(
        finalize(() => {

          this.loadingGradeLevels.set(false);
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: gradeLevels => {

          this.gradeLevels.set(gradeLevels);
        },

        error: () => {

          this.lookupError.set(
            'Класовете не могат да бъдат заредени.'
          );
        },
      });
  }


  private onGradeLevelChanged(
    gradeLevelId: number | null
  ): void {

    const schoolClassControl = this.form.controls.schoolClassId;


    schoolClassControl.setValue(null);

    this.schoolClasses.set([]);
    this.lookupError.set(null);


    if (gradeLevelId == null) {

      schoolClassControl.disable({ emitEvent: false, });

      return;
    }


    schoolClassControl.enable({ emitEvent: false, });


    this.loadingSchoolClasses.set(true);


    this.lookupApi
      .getSchoolClasses(gradeLevelId)
      .pipe(
        finalize(() => {

          this.loadingSchoolClasses.set(false);
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: schoolClasses => {

          this.schoolClasses.set(schoolClasses);
        },

        error: () => {

          this.schoolClasses.set([]);

          this.lookupError.set(
            'Паралелките не могат да бъдат заредени.'
          );
        },
      });
  }


  private getRegistrationError(error: HttpErrorResponse): string {

    if (error.status === 400) {

      if (error.error?.errors) {

        const errors = Object.values(
          error.error.errors
        ).flat();

        const firstError =
          errors.find(
            value => typeof value === 'string'
          );

        if (typeof firstError === 'string') {

          return firstError;
        }
      }


      if (typeof error.error?.detail === 'string') {

        return error.error.detail;
      }


      if (typeof error.error?.message === 'string') {

        return error.error.message;
      }
    }


    return 'Регистрацията не беше успешна. Моля, опитайте отново.';
  }


  readonly firstName = this.form.controls.firstName;

  readonly fatherName = this.form.controls.fatherName;

  readonly lastName = this.form.controls.lastName;

  readonly email = this.form.controls.email;

  readonly password = this.form.controls.password;

  readonly confirmPassword = this.form.controls.confirmPassword;

  readonly gradeLevelId = this.form.controls.gradeLevelId;

  readonly schoolClassId = this.form.controls.schoolClassId;
}