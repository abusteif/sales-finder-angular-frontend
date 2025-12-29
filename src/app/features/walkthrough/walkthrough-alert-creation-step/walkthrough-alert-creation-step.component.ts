import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GENERIC_SETTINGS } from '../../../core/constants/generic-settings';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-walkthrough-alert-creation-step',
  standalone: false,
  templateUrl: './walkthrough-alert-creation-step.component.html',
  styleUrls: ['./walkthrough-alert-creation-step.component.css'],
})
export class WalkthroughAlertCreationStepComponent {
  appName = GENERIC_SETTINGS.app_name;
  
  @Output() skip = new EventEmitter<void>();

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  onSkip() {
    this.analyticsService.trackEvent('button_click', {
      button_name: 'skip',
      page: 'walkthrough',
      step: 3
    });
    this.skip.emit();
  }

  onJoinClick() {
    this.analyticsService.trackEvent('button_click', {
      button_name: 'join',
      page: 'walkthrough',
      step: 3
    });
    this.router.navigate(['/signup']);
  }
}

