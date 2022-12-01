import { AbstractControl } from '@angular/forms';
export function ValidateIntValue(control: AbstractControl): { invalidIntValue: boolean } | null {
    const INTVALUE_REGEXP = /^\d+$/;
    return !INTVALUE_REGEXP.test(control.value) ? { invalidIntValue: true } : null;
} // ValidatePhone