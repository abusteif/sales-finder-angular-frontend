import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';
import { StorageService } from '../../core/services/storage.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  appName = GENERIC_SETTINGS.app_name;
  defaultDescription = GENERIC_SETTINGS.defaultDescription;
  @Output() appAccessed = new EventEmitter<boolean>();
  constructor(
    private storageService: StorageService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    // Page view is already tracked automatically via route monitoring
  }

  onGetStarted() {
    // Track Get Started button click
    this.analyticsService.trackEvent('button_click', {
      button_name: 'get_started',
      page: 'landing'
    });
    this.storageService.markAppAsAccessed();
    this.storageService.setWalkthroughVersion(GENERIC_SETTINGS.walkthroughVersion);
    this.appAccessed.emit(true);
  }
}

