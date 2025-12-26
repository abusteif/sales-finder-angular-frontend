import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GENERIC_SETTINGS } from '../../../core/constants/generic-settings';

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
  onBrowsingDealsChange(checked: boolean) {
    this.browsingDealsChange.emit(checked);
  }

  onTrackingItemsChange(checked: boolean) {
    this.trackingItemsChange.emit(checked);
  }

  onContinue() {
    this.continue.emit();
  }

  onSkip() {
    this.skip.emit();
  }
}

