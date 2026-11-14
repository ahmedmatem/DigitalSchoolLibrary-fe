import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordPolicyValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = String(control.value ?? '');
  const errors: ValidationErrors = {};

  if (value && !/[a-z]/.test(value)) errors['requiresLowercase'] = true;
  if (value && !/\d/.test(value)) errors['requiresDigit'] = true;

  return Object.keys(errors).length ? errors : null;
};
