import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/authentication.service';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: false,
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.css']
})
export class ForgotPasswordPageComponent {
  
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private navigationService: NavigationService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  getFieldError(fieldName: string): string  {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.hasError('required')) {
        return 'Email is required';
      }
      if (field.hasError('email')) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      
      const { email } = this.forgotPasswordForm.value;
      
      this.authenticationService.requestPasswordReset(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Password reset email sent! Please check your inbox and follow the instructions.';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to send password reset email. Please try again.';
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  backToLogin() {
    this.navigationService.navigateToPublicRoute('/login');
  }
} 