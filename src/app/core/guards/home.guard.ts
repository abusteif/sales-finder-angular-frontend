import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationStore } from '../../state/authentication.store';

export const homeGuard = () => {
  // Public routes are accessible to everyone
  return true;
}; 