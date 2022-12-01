import { AbstractControl } from '@angular/forms';
export function ValidateEmail(control: AbstractControl): { invalidEmail: boolean } | null {
    const EMAIL_REGEXP = /^[\w|\d]+@\w+.com$/;
    return !EMAIL_REGEXP.test(control.value) ? { invalidEmail: true } : null;
} // ValidateEmail