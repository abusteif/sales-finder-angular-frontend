import { Component, effect, OnInit } from '@angular/core';
import { AlertsStore } from '../../state/alerts.store';
import { Alert } from '../../core/models/alert.model';
import { storesStore } from '../../state/stores.store';
import { Store } from '../../core/models/store.model';
import { AuthenticationStore } from '../../state/authentication.store';
import { User } from '../../core/models/user.models';
import { Item } from '../../core/models/item.model';

@Component({
  selector: 'app-alerts-page',
  standalone: false,
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.css'
})
export class AlertsPageComponent implements OnInit {

  alerts: Alert[] = [];
  allAlerts: Alert[] = [];
  showActiveOnly = false;
  showAlertModal = false;
  stores: Store[] = [];
  alert: Alert | null = null;
  user: User | null = null;
  loading = false;
  existingItemDetails: Item | null = null;
  constructor(
    private alertsStore: AlertsStore,
    private storesStore: storesStore,
    private authenticationStore: AuthenticationStore,
  ) {
    effect(() => {
      this.allAlerts = this.alertsStore.alerts();
      this.filterAlerts();
      this.stores = this.storesStore.stores();
      this.user = this.authenticationStore.user();
      this.loading = this.alertsStore.loading();
    });
  }

  ngOnInit(): void {
    this.alertsStore.loadAlerts();
    this.storesStore.loadStores();
  }

  onActiveOnlyToggled(showActiveOnly: boolean): void {
    this.showActiveOnly = showActiveOnly;
    this.filterAlerts();
  }

  onAddAlertClicked(): void {
    this.showAlertModal = true;
  }

  onDeleteAlert(alertId: string): void {
    this.alertsStore.deleteAlert(alertId);
  }

  onEditAlert(alert: Alert): void {
    this.showAlertModal = true;
    this.alert = alert;
    if (alert.url && alert.imageUrl) {
      this.existingItemDetails = {
        name: alert.item,
        url: alert.url,
        imageUrl: alert.imageUrl,
        store: alert.stores[0],
      } as Item;
    }
  }

  onToggleAlert(alert: Alert): void {
    this.alertsStore.updateAlertStatus(alert.id!, !alert.isActive);
  }

  closeAlertModal() {
    this.showAlertModal = false;
    this.alert = null;
  }

  private filterAlerts(): void {
    if (this.showActiveOnly) {
      this.alerts = this.allAlerts.filter(alert => alert.isActive);
    } else {
      this.alerts = this.allAlerts;
    }
  }
}
