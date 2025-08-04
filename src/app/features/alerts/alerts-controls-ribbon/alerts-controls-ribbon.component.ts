import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../core/models/user.models';
import { Alert } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alerts-controls-ribbon',
  standalone: false,
  templateUrl: './alerts-controls-ribbon.component.html',
  styleUrl: './alerts-controls-ribbon.component.css'
})
export class AlertsControlsRibbonComponent {
  @Output() activeOnlyToggled = new EventEmitter<boolean>();
  @Output() addAlertClicked = new EventEmitter<void>();
  @Input() alerts: Alert[] = [];
  @Input() set user(user: User | null) {
    this.maxAlerts = user?.maxAlerts || 0;
  }
  showActiveOnly = false;
  maxAlerts = 0;
  toggleActiveOnly(): void {
    this.showActiveOnly = !this.showActiveOnly;
    this.activeOnlyToggled.emit(this.showActiveOnly);
  }

  addNewAlert(): void {
    this.addAlertClicked.emit();
  }

  onUpgradeClick(event: Event): void {
    event.preventDefault();
    // TODO: Implement upgrade functionality
    console.log('Upgrade clicked from alerts controls ribbon');
    // You can emit an event to the parent component to handle the upgrade navigation
  }
}
