import { Component } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { BRAND_NAME } from '../../core/constants/brand';

@Component({
  selector: 'app-activation-confirmation-page',
  standalone: false,
  templateUrl: './activation-confirmation-page.component.html',
  styleUrl: './activation-confirmation-page.component.css'
})
export class ActivationConfirmationPageComponent {
  brandName = BRAND_NAME;
  constructor(
    private navigationService: NavigationService
  ) {}

  goToLogin(): void {
    this.navigationService.navigateToPublicRoute('/login');
  }

  goToHome(): void {
    this.navigationService.navigateToHome();
  }
} 