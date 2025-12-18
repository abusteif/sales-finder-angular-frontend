import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppStore } from './state/app.store';
import { AuthenticationStore } from './state/authentication.store';
import { effect } from '@angular/core';
import { FilterStore } from './state/filter.store';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SeoService, SeoMetadata } from './core/services/seo.service';
import { GENERIC_SETTINGS } from './core/constants/generic-settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggingOut = false;
  readonly GENERIC_SETTINGS = GENERIC_SETTINGS;
  private routerSubscription?: Subscription;
  private readonly resizeListener = () => this.checkScreenSize();

  constructor(
    private appStore: AppStore,
    private authenticationStore: AuthenticationStore,
    private filterStore: FilterStore,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService
  ) {
    effect(() => {
      this.isLoggingOut =
        this.authenticationStore.isLoading() &&
        this.authenticationStore.isAuthenticated();
    });

    this.authenticationStore.initialiseAuth();
    this.filterStore.loadFilterPreferences();
    this.appStore.loadDisplaySettings();
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);
    this.monitorRouteSeo();
  }

  checkScreenSize() {
    const isMobile = window.innerWidth < 768;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.appStore.setScreenDetails(isMobile, screenWidth, screenHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
    this.routerSubscription?.unsubscribe();
  }

  private monitorRouteSeo() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      const activeRoute = this.getDeepestChildRoute(this.activatedRoute);
      const seoData = (activeRoute.snapshot.data?.['seo'] ??
        {}) as Partial<SeoMetadata>;
      const path = event.urlAfterRedirects.split('?')[0];
      const normalizedPath = this.normalizePathForCanonical(path);
      const canonicalUrl = `${GENERIC_SETTINGS.domain}${normalizedPath === '/' ? '' : normalizedPath}`;

      this.seoService.update({
        ...seoData,
        url: canonicalUrl,
      });
    });
  }

  private normalizePathForCanonical(path: string): string {
    if (!path || path === '/') {
      return '/';
    }

    // Ensure leading slash and strip trailing slashes to avoid duplicate canonicals like /faq vs /faq/
    const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
    return withLeadingSlash.replace(/\/+$/, '');
  }

  private getDeepestChildRoute(route: ActivatedRoute): ActivatedRoute {
    let deepestRoute = route;

    while (deepestRoute.firstChild) {
      deepestRoute = deepestRoute.firstChild;
    }

    return deepestRoute;
  }
}
