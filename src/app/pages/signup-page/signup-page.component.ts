import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthenticationService } from '../../core/services/authentication.service';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-signup-page',
  standalone: false,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  signupError = '';
  passwordStrength = {
    score: 0,
    message: '',
    color: '#e0e0e0'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      // acceptTerms: [false, [Validators.requiredTrue]],
    });

    // Add custom validator for password matching
    this.signupForm.addValidators(this.passwordMatchValidator);

    // Listen to password changes for strength calculation
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.calculatePasswordStrength(password); // Calculate password strength  
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup;
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = { score: 0, message: '', color: '#e0e0e0' };
      return;
    }

    let score = 0;
    let message = '';

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    // Determine strength level
    if (score <= 2) {
      message = 'Weak';
      this.passwordStrength.color = '#e74c3c';
    } else if (score <= 4) {
      message = 'Fair';
      this.passwordStrength.color = '#f39c12';
    } else if (score < 6) {
      message = 'Good';
      this.passwordStrength.color = '#f1c40f';
    } else {
      message = 'Strong';
      this.passwordStrength.color = '#27ae60';
    }

    this.passwordStrength = { score, message, color: this.passwordStrength.color };
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.hasError('required')) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.hasError('email')) {
        return 'Please enter a valid email address';
      }
      if (field.hasError('minlength')) {
        const minLength = field.getError('minlength').requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.hasError('maxlength')) {
        const maxLength = field.getError('maxlength').requiredLength;
        return `${this.getFieldLabel(fieldName)} must be no more than ${maxLength} characters`;
      }
      if (field.hasError('pattern')) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password'
    };
    return labels[fieldName] || fieldName;
  }

  getPasswordMismatchError(): string {
    if (this.signupForm.hasError('passwordMismatch') && 
        this.signupForm.get('confirmPassword')?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.signupError = '';

    const { firstName, lastName, email, password } = this.signupForm.value;

    this.authService.register(email, password, firstName, lastName).subscribe({
      next: (response) => {
        // Handle successful registration
        this.isLoading = false;
        // Set a flag in session storage to allow access to activation confirmation page
        sessionStorage.setItem('fromSignup', 'true');
        // Redirect to activation confirmation page
        this.navigationService.navigateToPublicRoute('/activation-confirmation');
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.signupError = 'An account with this email already exists';
        } else if (error.status === 400) {
          this.signupError = 'Please check your information and try again';
        } else {
          this.signupError = 'Registration failed. Please try again later.';
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  getPasswordStrengthWidth(): string {
    return `${(this.passwordStrength.score / 7) * 100}%`;
  }

  login() {
    this.navigationService.navigateToPublicRoute('/login');
  }
}
