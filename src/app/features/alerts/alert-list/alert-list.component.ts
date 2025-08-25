import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Alert } from '../../../core/models/alert.model';
import { Store } from '../../../core/models/store.model';

@Component({
  selector: 'app-alert-list',
  standalone: false,
  templateUrl: './alert-list.component.html',
  styleUrl: './alert-list.component.css'
})
export class AlertListComponent {
  @Input() alerts: Alert[] = [];
  @Input() stores: Store[] = [];
  @Input() loading = false;
  @Output() newAlertClicked = new EventEmitter<void>();
  @Output() deleteAlert = new EventEmitter<string>();
  @Output() editAlert = new EventEmitter<Alert>();
  @Output() toggleAlert = new EventEmitter<Alert>();
  
  onNewAlertClicked() {
    this.newAlertClicked.emit();
  }

  onDeleteAlert(alertId: string) {
    this.deleteAlert.emit(alertId);
  }

  onEditAlert(alert: Alert) {
    this.editAlert.emit(alert);
  }

  onToggleAlert(alert: Alert) {
    this.toggleAlert.emit(alert);
  }
}
