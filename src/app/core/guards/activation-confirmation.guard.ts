import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ActivationConfirmationGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if the user came from the signup page
    const referrer = document.referrer;
    const currentUrl = window.location.origin;
    
    // Allow access if the referrer is from the signup page
    if (referrer && referrer.includes('/signup')) {
      return true;
    }
    
    // Check if there's a session storage flag set during signup
    const fromSignup = sessionStorage.getItem('fromSignup');
    if (fromSignup === 'true') {
      // Clear the flag after use
      sessionStorage.removeItem('fromSignup');
      return true;
    }
    
    // Redirect to signup page if accessed directly
    this.router.navigate(['/signup']);
    return false;
  }
} 