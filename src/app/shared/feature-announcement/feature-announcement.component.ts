import { Component, OnInit, Input, signal } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';

export const dialogClosedSignal = signal<boolean>(false);

@Component({
  selector: 'app-feature-announcement',
  standalone: false,
  templateUrl: './feature-announcement.component.html',
  styleUrl: './feature-announcement.component.css',
})
export class FeatureAnnouncementComponent implements OnInit {
  @Input() title: string = "What's New";
  @Input() buttonText: string = 'Got it!';
  @Input() versionKey: 'app' | 'compare' = 'app';
  @Input() skipVersionCheck: boolean = false;

  showModal: boolean = false;
  readonly appName = GENERIC_SETTINGS.app_name;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    if (!this.skipVersionCheck) {
      this.checkVersionAndShowModal();
    }
  }

  @Input() set show(shouldShow: boolean) {
    if (shouldShow) {
      this.showModal = true;
    }
  }

  private checkVersionAndShowModal(): void {
    let storedVersion: string | null;
    let latestVersion: string;

    storedVersion = this.storageService.getAppVersion();
    latestVersion = GENERIC_SETTINGS.appVersion;

    if (!storedVersion || this.isVersionLower(storedVersion, latestVersion)) {
      this.showModal = true;
    }
  }

  private isVersionLower(version1: string, version2: string): boolean {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) {
        return true;
      } else if (v1Part > v2Part) {
        return false;
      }
    }

    return false;
  }

  closeModal(): void {
    let latestVersion: string = GENERIC_SETTINGS.appVersion;
    this.showModal = false;
    this.storageService.setAppVersion(latestVersion);
  }

  onGotIt(): void {
    this.closeModal();
    dialogClosedSignal.set(true);
  }
}
