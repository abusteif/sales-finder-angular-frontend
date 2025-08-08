import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';
import { PasswordValidationService } from '../../core/services/password-validation.service';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
  selector: 'app-password-reset-confirm-page',
  standalone: false,
  templateUrl: './password-reset-confirm-page.component.html',
  styleUrls: ['./password-reset-confirm-page.component.css']
})
export class PasswordResetConfirmPageComponent implements OnInit {
  
  passwordResetForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  token: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private passwordValidationService: PasswordValidationService,
    private authenticationService: AuthenticationService
  ) {
    this.passwordResetForm = this.formBuilder.group({
      password: ['', this.passwordValidationService.getPasswordValidators()],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get token from URL parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.errorMessage = 'Invalid password reset link. Please request a new password reset.';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  getFieldError(fieldName: string): string  {
    const field = this.passwordResetForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (fieldName === 'password') {
        if (field.hasError('required')) {
          return this.passwordValidationService.getPasswordErrorMessage('required');
        }
        if (field.hasError('minlength')) {
          return this.passwordValidationService.getPasswordErrorMessage('minlength');
        }
        if (field.hasError('pattern')) {
          return this.passwordValidationService.getPasswordErrorMessage('pattern');
        }
      } else {
        if (field.hasError('required')) {
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        if (field.hasError('minlength')) {
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least 8 characters`;
        }
      }
      if (field.hasError('passwordMismatch')) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  onSubmit() {
    if (this.passwordResetForm.valid && this.token) {
      this.isLoading = true;
      this.errorMessage = null;
      
      const { password } = this.passwordResetForm.value;
      
      // Call the authentication service to reset password
      this.authenticationService.resetPassword(this.token, password).subscribe({
        next: () => {
          this.successMessage = 'Password reset successfully! Redirecting to login...';
          setTimeout(() => {
            this.isLoading = false;
            this.navigationService.navigateToPublicRoute('/login');
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
        }
      });
    } else {
      this.passwordResetForm.markAllAsTouched();
    }
  }

  backToLogin() {
    this.navigationService.navigateToPublicRoute('/login');
  }

  requestNewReset() {
    this.navigationService.navigateToPublicRoute('/login');
  }
} 