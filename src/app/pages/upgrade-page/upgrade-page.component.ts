import { Component } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { AuthenticationStore } from '../../state/authentication.store';

@Component({
  selector: 'app-upgrade-page',
  standalone: false,
  templateUrl: './upgrade-page.component.html',
  styleUrl: './upgrade-page.component.css'
})
export class UpgradePageComponent {
  constructor(private navigationService: NavigationService, private authenticationStore: AuthenticationStore) {}

  onBackToHome() {
    this.navigationService.navigateToHome();
  }

  onViewAlerts() {
    this.navigationService.navigateToProtectedRoute('/alerts', {}, this.authenticationStore.isAuthenticated());
  }
}
