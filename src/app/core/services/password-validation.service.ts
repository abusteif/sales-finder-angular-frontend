import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PasswordValidationService {

  constructor() { }

  /**
   * Returns the password validation rules as an array of validators
   */
  getPasswordValidators() {
    return [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ];
  }

  /**
   * Returns the password pattern regex for custom validation
   */
  getPasswordPattern() {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  }

  /**
   * Returns the error message for password validation errors
   */
  getPasswordErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'required':
        return 'Password is required';
      case 'minlength':
        return 'Password must be at least 8 characters';
      case 'pattern':
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
      default:
        return '';
    }
  }

  /**
   * Returns the password requirements description for UI display
   */
  getPasswordRequirements(): string {
    return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
  }
}
