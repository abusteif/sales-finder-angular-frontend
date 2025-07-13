import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationStore } from '../../state/authentication.store';

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authenticationStore = inject(AuthenticationStore);
    const router = inject(Router);

    if (!authenticationStore.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const user = authenticationStore.user();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    // Check if user has required role
    // You can extend the User model to include roles
    // For now, this is a placeholder for future role-based access
    const hasRequiredRole = allowedRoles.some(role => {
      // Example: user.roles?.includes(role)
      return true; // Placeholder - implement based on your role system
    });

    if (!hasRequiredRole) {
      router.navigate(['/']);
      return false;
    }

    return true;
  };
}; 