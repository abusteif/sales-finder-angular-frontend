import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly protectedRoutes = ['/profile', '/alerts'];

  constructor(
    private router: Router,
  ) { }

  handleNavigationAfterLogout(): void {
    if (this.isCurrentRouteProtected()) {
      this.router.navigate(['/']);
    }
  }

  isCurrentRouteProtected(): boolean {
    return this.protectedRoutes.some(protectedRoute => this.router.url.startsWith(protectedRoute));
  }

  navigateToProtectedRoute(route: string, queryParams?: any, isAuthenticated: boolean = false): void {
    if (isAuthenticated) {
      this.router.navigate([route], { queryParams }).then(
        () => {
        },
        (error) => {
          console.error('Navigation failed:', error);
        }
      );
    } else {
      const returnUrl = queryParams ? `${route}?${new URLSearchParams(queryParams).toString()}` : route;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    }
  }

  navigateToPublicRoute(route: string, queryParams?: any): void {
    this.router.navigate([route], { queryParams });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
} 