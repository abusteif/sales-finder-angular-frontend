import { Component, HostListener } from '@angular/core';
import { User } from '../../core/models/user.models';
import { AuthenticationStore } from '../../state/authentication.store';
import { NavigationService } from '../../core/services/navigation.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { map, take } from 'rxjs';
import { effect } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isUserSettingsOpen = false;
  user: User | null = null;
  isAuthenticated = false;
  viewProfileClicked = false;
  viewAlertsClicked = false;
  constructor(
    private authenticationStore: AuthenticationStore,
    private navigationService: NavigationService,
    private authenticationService: AuthenticationService
  ) {
    effect(() => {
      this.user = this.authenticationStore.user();
      const isLoading = this.authenticationStore.isLoading();
      if (isLoading) {
        return;
      }
      if (this.viewProfileClicked) {
        this.viewProfileClicked = false;
        this.navigationService.navigateToProtectedRoute(
          '/profile',
          {},
          !!this.user
        );
      }
      if (this.viewAlertsClicked) {
        this.viewAlertsClicked = false;
        this.navigationService.navigateToProtectedRoute(
          '/alerts',
          {},
          !!this.user
        );
      }
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
    this.authenticationStore.initialiseAuth();
    this.isUserSettingsOpen = true;
  }

  welcomeMessage() {
    return this.authenticationStore.user()?.firstName
      ? `Welcome, ${this.authenticationStore.user()?.firstName}`
      : '';
  }

  viewProfile() {
    this.viewProfileClicked = true;
    this.authenticationStore.initialiseAuth();
  }

  viewAlerts() {
    this.viewAlertsClicked = true;
    this.authenticationStore.initialiseAuth();
  }

  login() {
    this.authenticationStore.initialiseAuth();
    this.navigationService.navigateToPublicRoute('/login');
  }

  signup() {
    this.authenticationStore.initialiseAuth();
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

  aboutUs() {
    this.navigationService.navigateToPublicRoute('/about-us');
    this.isUserSettingsOpen = false;
  }

  logout() {
    this.authenticationStore.logout();
    this.isUserSettingsOpen = false;
  }
}
