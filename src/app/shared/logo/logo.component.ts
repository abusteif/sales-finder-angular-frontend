import { Component, Input } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css'
})
export class LogoComponent {
  constructor(private navigationService: NavigationService) {}

  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'default' | 'navbar' | 'footer' | 'standalone' = 'default';
  @Input() showText: boolean = true;
  @Input() clickable: boolean = false;
  @Input() routerLink: string = '/';

  logoSrc: string = 'assets/logos/bargain-radar-logo.svg';

  get logoClasses(): string {
    return `logo-container ${this.variant} ${this.size} ${this.clickable ? 'clickable' : ''}`;
  }

  get logoSvgClasses(): string {
    return `logo ${this.size}`;
  }

  onLogoClick(): void {
    if (this.clickable) {
      this.navigationService.navigateToPublicRoute(this.routerLink);
    }
  }
}
