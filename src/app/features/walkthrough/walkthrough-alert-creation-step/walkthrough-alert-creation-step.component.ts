import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GENERIC_SETTINGS } from '../../../core/constants/generic-settings';

@Component({
  selector: 'app-walkthrough-alert-creation-step',
  standalone: false,
  templateUrl: './walkthrough-alert-creation-step.component.html',
  styleUrls: ['./walkthrough-alert-creation-step.component.css'],
})
export class WalkthroughAlertCreationStepComponent {
  appName = GENERIC_SETTINGS.app_name;
  
  @Output() skip = new EventEmitter<void>();

  constructor(private router: Router) {}

  onSkip() {
    this.skip.emit();
  }

  onJoinClick() {
    this.router.navigate(['/signup']);
  }
}

