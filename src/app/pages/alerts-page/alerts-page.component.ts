import { Component, effect, OnInit } from '@angular/core';
import { AlertsStore } from '../../state/alerts.store';
import { Alert } from '../../core/models/alert.model';

@Component({
  selector: 'app-alerts-page',
  standalone: false,
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.css'
})
export class AlertsPageComponent implements OnInit {

  alerts: Alert[] = [];

  constructor(
    private alertsStore: AlertsStore,
  ) {
    effect(() => {
      this.alerts = this.alertsStore.alerts();
    });
  }
  
  ngOnInit(): void {
    this.alertsStore.loadAlerts();
  }





}
