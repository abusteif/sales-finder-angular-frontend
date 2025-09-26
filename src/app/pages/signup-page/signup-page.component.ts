import { Component } from '@angular/core';
import { AuthenticationService } from '../../core/services/authentication.service';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-signup-page',
  standalone: false,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  isLoading = false;
  signupError = '';

  constructor(
    private authService: AuthenticationService,
    private navigationService: NavigationService
  ) {}

  onFormSubmit(formData: {firstName: string, lastName: string, email: string, password: string}): void {
    this.isLoading = true;
    this.signupError = '';

    const { firstName, lastName, email, password } = formData;

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

  login() {
    this.navigationService.navigateToPublicRoute('/login');
  }

  navigateToContactUs() {
    this.navigationService.navigateToPublicRoute('/contact-us');
  }
}
