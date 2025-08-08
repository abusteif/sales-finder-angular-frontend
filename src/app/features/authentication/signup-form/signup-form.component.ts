import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PasswordValidationService } from '../../../core/services/password-validation.service';

@Component({
  selector: 'app-signup-form',
  standalone: false,
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})
export class SignupFormComponent implements OnInit {

  @Input() set isLoading(value: boolean) {
    this._isLoading = value;
    if (value) {
      this.signupForm?.disable();
    } else {
      this.signupForm?.enable();
    }
  }
  get isLoading() {
    return this._isLoading;
  }

  @Input() signupError: string | null = null;
  @Output() onFormSubmit = new EventEmitter<{firstName: string, lastName: string, email: string, password: string}>();
  
  private _isLoading = false;
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private passwordValidationService: PasswordValidationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.passwordValidationService.getPasswordValidators()],
      confirmPassword: ['', [Validators.required]],
    });

    // Add custom validator for password matching
    this.signupForm.addValidators(this.passwordMatchValidator);


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



  onSubmit(): void {
    if (this.signupForm.valid) {
      const { firstName, lastName, email, password } = this.signupForm.value;
      this.onFormSubmit.emit({ firstName, lastName, email, password });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
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


} 