import { Component } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { AuthenticationStore } from '../../state/authentication.store';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  constructor(private navigationService: NavigationService, private authenticationStore: AuthenticationStore) {}

  onBackToHome() {
    this.navigationService.navigateToHome();
  }

  onViewAlerts() {
    this.navigationService.navigateToProtectedRoute('/alerts', {}, this.authenticationStore.isAuthenticated());
  }
}
