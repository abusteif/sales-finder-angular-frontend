import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-base-page',
  standalone: false,
  templateUrl: './admin-base-page.component.html',
  styleUrls: ['./admin-base-page.component.css']
})
export class AdminBasePageComponent {
  // Configuration inputs for customizing the base page
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showLogo: boolean = true;
  @Input() logoSize: 'small' | 'medium' | 'large' = 'large';
  @Input() logoVariant: 'default' | 'navbar' | 'footer' | 'standalone' = 'default';
  @Input() logoShowText: boolean = true;
  @Input() logoClickable: boolean = true;
  @Input() logoRouterLink: string = '/';
  @Input() hideNavbar: boolean = false;
  @Input() cardSize: 'small' | 'medium' | 'large' | '' = '';
  @Input() isLoading: boolean = false;
  @Input() loadingMessage: string = 'Loading...';

  constructor() {}

  ngOnInit() {
    // Initialize admin base page functionality here
  }

  // Keep logo large on all screen sizes - just return the original size
  get responsiveLogoSize(): 'small' | 'medium' | 'large' {
    return this.logoSize;
  }
}