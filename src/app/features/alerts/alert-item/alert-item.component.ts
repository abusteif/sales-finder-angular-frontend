import { Component, Input } from '@angular/core';
import { Alert } from '../../../core/models/alert.model';
import { AlertsStore } from '../../../state/alerts.store';

@Component({
  selector: 'app-alert-item',
  standalone: false,
  templateUrl: './alert-item.component.html',
  styleUrl: './alert-item.component.css'
})
export class AlertItemComponent {
  @Input() alert: Alert = {} as Alert;

  constructor(
    private alertsStore: AlertsStore
  ) {}

  toggleAlert(): void {
    // TODO: Implement toggle functionality
    console.log('Toggle alert:', this.alert.id);
  }

  editAlert(): void {
    // TODO: Implement edit functionality
    console.log('Edit alert:', this.alert.id);
  }

  deleteAlert(): void {
    // TODO: Implement delete functionality
    console.log('Delete alert:', this.alert.id);
  }
}
