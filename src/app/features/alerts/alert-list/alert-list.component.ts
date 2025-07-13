import { Component, Input } from '@angular/core';
import { Alert } from '../../../core/models/alert.model';

@Component({
  selector: 'app-alert-list',
  standalone: false,
  templateUrl: './alert-list.component.html',
  styleUrl: './alert-list.component.css'
})
export class AlertListComponent {
  @Input() alerts: Alert[] = [];
}
