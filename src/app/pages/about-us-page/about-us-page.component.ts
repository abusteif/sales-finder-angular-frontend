import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-about-us-page',
  standalone: false,
  templateUrl: './about-us-page.component.html',
  styleUrl: './about-us-page.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AboutUsPageComponent {
  constructor() {}

  getStarted(): void {
    window.open('/signup', '_blank');
  }

  contactUs(): void {
    window.open('/contact-us', '_blank');
  }
}
