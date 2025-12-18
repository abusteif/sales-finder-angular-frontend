import { Component, ViewEncapsulation } from '@angular/core';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: false,
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class NotFoundPageComponent {
  readonly appName = GENERIC_SETTINGS.app_name;

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
}


