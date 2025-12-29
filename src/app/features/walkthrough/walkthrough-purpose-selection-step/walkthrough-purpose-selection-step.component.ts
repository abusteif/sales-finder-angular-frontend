import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GENERIC_SETTINGS } from '../../../core/constants/generic-settings';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-walkthrough-purpose-selection-step',
  standalone: false,
  templateUrl: './walkthrough-purpose-selection-step.component.html',
  styleUrls: ['./walkthrough-purpose-selection-step.component.css'],
})
export class WalkthroughPurposeSelectionStepComponent {
  appName = GENERIC_SETTINGS.app_name;
  
  @Input() browsingDeals = false;
  @Input() trackingItems = false;

  @Output() browsingDealsChange = new EventEmitter<boolean>();
  @Output() trackingItemsChange = new EventEmitter<boolean>();
  @Output() continue = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();

  constructor(private analyticsService: AnalyticsService) {}

  onBrowsingDealsChange(checked: boolean) {
    this.analyticsService.trackEvent('walkthrough_selection', {
      selection_type: 'purpose',
      value: 'browse_deals',
      selected: checked,
      step: 1
    });
    this.browsingDealsChange.emit(checked);
  }

  onTrackingItemsChange(checked: boolean) {
    this.analyticsService.trackEvent('walkthrough_selection', {
      selection_type: 'purpose',
      value: 'track_items',
      selected: checked,
      step: 1
    });
    this.trackingItemsChange.emit(checked);
  }

  onContinue() {
    this.analyticsService.trackEvent('button_click', {
      button_name: 'continue',
      page: 'walkthrough',
      step: 1,
      browsing_deals: this.browsingDeals,
      tracking_items: this.trackingItems
    });
    this.continue.emit();
  }

  onSkip() {
    this.analyticsService.trackEvent('button_click', {
      button_name: 'skip',
      page: 'walkthrough',
      step: 1
    });
    this.skip.emit();
  }
}

