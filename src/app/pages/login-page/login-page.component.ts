import { Component, effect } from '@angular/core';
import { AuthenticationStore } from '../../state/authentication.store';
import { Router, ActivatedRoute } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  isLoading = false;
  loginError: string | null = null;
  private returnUrl: string = '/';
  
  constructor(
    private authenticationStore: AuthenticationStore, 
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    // Get the return URL from query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
    });

    effect(() => {
      this.isLoading = this.authenticationStore.isLoading();
      this.loginError = this.authenticationStore.error();
    });
    
    effect(() => {
      // Navigate to return URL when user is authenticated
      if (this.authenticationStore.isAuthenticated() && this.authenticationStore.user()) {
        // Parse the return URL to handle query parameters properly
        const [path, queryString] = this.returnUrl.split('?');
        const queryParams = queryString ? 
          Object.fromEntries(new URLSearchParams(queryString)) : 
          {};
        
        this.router.navigate([path], { queryParams });
      }
    });
  }

  onFormSubmit(formData: {email: string, password: string, stayLoggedIn: boolean}) {
    this.authenticationStore.login(formData.email, formData.password, formData.stayLoggedIn);
  }

  navigateToSignup() {
    this.navigationService.navigateToPublicRoute('/signup');
  }

  navigateToContactUs() {
    this.navigationService.navigateToPublicRoute('/contact-us');
  }
}
