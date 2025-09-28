import { Component, effect, HostListener } from '@angular/core';
import { User } from '../../core/models/user.models';
import { Router } from '@angular/router';
// import { UserStore } from '../../state/user.store';
import { AuthenticationStore } from '../../state/authentication.store';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isUserSettingsOpen = false;
  user: User | null = null;
  isAuthenticated = false;
  constructor(
    private router: Router, 
    // private userStore: UserStore,
    private authenticationStore: AuthenticationStore,
    private navigationService: NavigationService
  ) {
    effect(() => {
      // Use authentication store's user state
      this.user = this.authenticationStore.user();
      this.isAuthenticated = this.authenticationStore.isAuthenticated();
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-settings-container')) {
      this.isUserSettingsOpen = false;
    }
  }

  openUserSettings(event: MouseEvent) {
    event.stopPropagation();
    this.isUserSettingsOpen = !this.isUserSettingsOpen;
  }

  welcomeMessage() {
    return this.authenticationStore.user()?.firstName ? `Welcome, ${this.authenticationStore.user()?.firstName}` : '';
  }

  viewProfile() {
    this.navigationService.navigateToProtectedRoute('/profile', {}, this.isAuthenticated);
  }

  viewAlerts() {
    this.navigationService.navigateToProtectedRoute('/alerts', {}, this.isAuthenticated);
  }

  login() {
    this.navigationService.navigateToPublicRoute('/login');
  }

  signup() {
    this.navigationService.navigateToPublicRoute('/signup');
  }

  contactUs() {
    this.navigationService.navigateToPublicRoute('/contact-us');
    this.isUserSettingsOpen = false;
  }

  faq() {
    this.navigationService.navigateToPublicRoute('/faq');
    this.isUserSettingsOpen = false;
  }

  logout() {
    this.authenticationStore.logout();
    this.isUserSettingsOpen = false;
  }
}
