import { AbstractControl } from '@angular/forms';
export function ValidateDecimalValue(control: AbstractControl): { invalidDecimalValue: boolean } | null {
    const DECIMALVALUE_REGEXP = /^\d+(\.)\d{2}$/;
    return !DECIMALVALUE_REGEXP.test(control.value) ? { invalidDecimalValue: true } : null;
} // ValidatePhone