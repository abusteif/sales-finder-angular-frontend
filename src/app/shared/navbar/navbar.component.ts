import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isUserSettingsOpen = false;
  user = {
    name: 'John Doe'
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

  logout() {
    this.isUserSettingsOpen = false;
    // Add your logout logic here
    // For example:
    // this.authService.logout();
    // this.router.navigate(['/login']);
  }
}
