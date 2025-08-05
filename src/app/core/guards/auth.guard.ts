import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationStore } from '../../state/authentication.store';

export const authGuard = () => {
  const authenticationStore = inject(AuthenticationStore);
  const router = inject(Router);

  if (authenticationStore.isAuthenticated()) {
    return true;
  }

  // Redirect to login page if not authenticated
  router.navigate(['/login']);
  return false;
}; 