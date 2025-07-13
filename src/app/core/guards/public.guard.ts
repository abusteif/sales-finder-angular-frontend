import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationStore } from '../../state/authentication.store';

export const publicGuard = () => {
  const authenticationStore = inject(AuthenticationStore);
  const router = inject(Router);

  if (authenticationStore.isAuthenticated()) {
    // Redirect authenticated users to home page
    router.navigate(['/']);
    return false;
  }

  return true;
}; 