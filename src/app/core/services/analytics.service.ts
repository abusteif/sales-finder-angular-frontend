import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare let gtag: (...args: any[]) => void;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private measurementId: string;
  private isInitialized = false;

  constructor() {
    this.measurementId = environment.ga4MeasurementId;
  }

  /**
   * Initialize Google Analytics 4
   * Call this method once when the app starts
   */
  initialize(): void {
    if (!this.measurementId) {
      if (!environment.production) {
        console.warn('GA4: No measurement ID configured. Analytics will not be initialized.');
      }
      return;
    }

    if (this.isInitialized) {
      return;
    }

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
      if (!environment.production) {
        console.log('GA4 Event:', arguments[0], arguments[1], arguments[2]);
      }
    };

    // Load GA4 script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script1);

    // Initialize GA4 configuration
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.measurementId, {
      send_page_view: false, // We'll handle page views manually
      debug_mode: !environment.production, // Enable debug mode in development
    });

    this.isInitialized = true;

    if (!environment.production) {
      console.log('GA4 initialized with Measurement ID:', this.measurementId);
    }
  }

  /**
   * Track a page view
   * @param pagePath - The path of the page (e.g., '/home', '/item/123')
   * @param pageTitle - Optional page title
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (!this.isInitialized || !this.measurementId) {
      if (!environment.production) {
        console.warn('GA4: Cannot track page view - analytics not initialized');
      }
      return;
    }

    (window as any).gtag('config', this.measurementId, {
      page_path: pagePath,
      page_title: pageTitle,
    });

    if (!environment.production) {
      console.log('GA4 Page View:', { pagePath, pageTitle });
    }
  }

  /**
   * Track a custom event
   * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
   * @param eventParams - Optional parameters for the event
   */
  trackEvent(eventName: string, eventParams?: Record<string, any>): void {
    if (!this.isInitialized || !this.measurementId) {
      if (!environment.production) {
        console.warn('GA4: Cannot track event - analytics not initialized');
      }
      return;
    }

    (window as any).gtag('event', eventName, eventParams);

    if (!environment.production) {
      console.log('GA4 Event:', eventName, eventParams);
    }
  }

  /**
   * Track user login
   * @param method - Login method used (e.g., 'email', 'google')
   */
  trackLogin(method?: string): void {
    this.trackEvent('login', {
      method: method || 'email',
    });
  }

  /**
   * Track user signup
   * @param method - Signup method used (e.g., 'email', 'google')
   */
  trackSignUp(method?: string): void {
    this.trackEvent('sign_up', {
      method: method || 'email',
    });
  }

  /**
   * Track item view
   * @param itemId - ID of the item being viewed
   * @param itemName - Name of the item
   */
  trackItemView(itemId: string, itemName?: string): void {
    this.trackEvent('view_item', {
      item_id: itemId,
      item_name: itemName,
    });
  }

  /**
   * Track alert creation
   * @param alertType - Type of alert created
   */
  trackAlertCreation(alertType?: string): void {
    this.trackEvent('create_alert', {
      alert_type: alertType,
    });
  }
}

