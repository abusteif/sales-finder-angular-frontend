import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  @Input() set isLoading(value: boolean) {
    this._isLoading = value;
    if (value) {
      this.loginForm?.disable();
    } else {
      this.loginForm?.enable();
    }
  }
  get isLoading() {
    return this._isLoading;
  }

  @Input() loginError: string | null = null;
  @Output() onFormSubmit = new EventEmitter<{email: string, password: string, stayLoggedIn: boolean}>();
  private _isLoading = false;
  loginForm!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      stayLoggedIn: false
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.onFormSubmit.emit(this.loginForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (fieldName === 'email') {
        if (field?.errors?.['required']) return 'Email is required';
        if (field?.errors?.['email']) return 'Please enter a valid email';
      }
      if (fieldName === 'password') {
        if (field?.errors?.['required']) return 'Password is required';
        if (field?.errors?.['minlength']) return 'Password must be at least 6 characters';
      }
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
