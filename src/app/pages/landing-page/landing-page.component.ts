import { Component, EventEmitter, Output } from '@angular/core';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
  appName = GENERIC_SETTINGS.app_name;
  defaultDescription = GENERIC_SETTINGS.defaultDescription;
  @Output() appAccessed = new EventEmitter<boolean>();
  constructor(
    private storageService: StorageService,
  ) {}

  onGetStarted() {
    this.storageService.markAppAsAccessed();
    this.storageService.setWalkthroughVersion(GENERIC_SETTINGS.walkthroughVersion);
    this.appAccessed.emit(true);
  }
}

