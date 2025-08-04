import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/authentication.service';
import { NavigationService } from '../../core/services/navigation.service';
import { BRAND_NAME } from '../../core/constants/brand';

@Component({
  selector: 'app-account-activation-page',
  standalone: false,
  templateUrl: './account-activation-page.component.html',
  styleUrl: './account-activation-page.component.css'
})
export class AccountActivationPageComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  isError = false;
  errorMessage = '';
  activationToken = '';
  brandName = BRAND_NAME;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.handleActivation();
  }

  private handleActivation(): void {
    // Get the activation token from URL parameters
    this.route.queryParams.subscribe(params => {
      this.activationToken = params['token'] || '';
      
      if (!this.activationToken) {
        this.handleError('Invalid activation link. Please check your email and try again.');
        return;
      }

      this.activateAccount();
    });
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.isError = true;
    this.errorMessage = message;
  }

  private activateAccount(): void {
    this.isLoading = true;
    this.isError = false;
    this.errorMessage = '';

    this.authService.activateAccount(this.activationToken).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        // Set a flag to allow access to login page with success message
        sessionStorage.setItem('activationSuccess', 'true');
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        
        if (error.status === 400) {
          this.errorMessage = 'Invalid or expired activation link. Please request a new one.';
        } else if (error.status === 409) {
          this.errorMessage = 'Account is already activated. You can now log in.';
        } else if (error.status === 404) {
          this.errorMessage = 'Activation link not found. Please check your email and try again.';
        } else {
          this.errorMessage = 'Activation failed. Please try again later or contact support.';
        }
      }
    });
  }

  goToLogin(): void {
    this.navigationService.navigateToPublicRoute('/login');
  }

  goToHome(): void {
    this.navigationService.navigateToHome();
  }

  requestNewActivation(): void {
    // This would typically open a form to request a new activation email
    // For now, redirect to signup page
    this.navigationService.navigateToPublicRoute('/signup');
  }
} 