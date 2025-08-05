import { Component } from '@angular/core';
import { AppStore } from './state/app.store';
import { AuthenticationStore } from './state/authentication.store';
import { effect } from '@angular/core';
import { FilterStore } from './state/filter.store';
// import { UserStore } from './state/user.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sales-finder-angular-frontend';
  isLoggingOut = false;

  constructor(
    private appStore: AppStore,
    private authenticationStore: AuthenticationStore,
    private filterStore: FilterStore,
    // private userStore: UserStore
  ) {
    effect(() => {
      // Show logout overlay when loading and user is authenticated
      this.isLoggingOut = this.authenticationStore.isLoading() && this.authenticationStore.isAuthenticated();
    });
    
    this.authenticationStore.initialiseAuth();
    this.filterStore.loadFilterPreferences();
    this.appStore.loadItemsPerPage();
  }
  
  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  } 

  checkScreenSize() {
    const isMobile = window.innerWidth < 768;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.appStore.setScreenDetails(isMobile, screenWidth, screenHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }
}
