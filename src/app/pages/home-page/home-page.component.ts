import { Component, effect, signal } from '@angular/core';
import { ItemsStore } from '../../state/items.store';
import { CategoriesStore } from '../../state/categories.store';
import { storesStore } from '../../state/stores.store';
import { Item, ItemAlert } from '../../core/models/item.model';
import { itemAlertSignal } from '../../features/item-display/item-card/item-card.component';
import { Alert } from '../../core/models/alert.model';
import { AlertsStore } from '../../state/alerts.store';
import { UserService } from '../../core/services/user.service';
import { AuthenticationStore } from '../../state/authentication.store';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  showAlertModal = false;
  itemAlertSignal = itemAlertSignal;
  itemAlert: ItemAlert | null = null;
  itemDetails: Item | null = null;
  alertId: string | null = null;
  alertDetails: Alert | null = null;
  constructor(
    private itemsStore: ItemsStore,
    private store: storesStore,
    private category: CategoriesStore,
    private alertsStore: AlertsStore,
    private userService: UserService,
    private authenticationStore: AuthenticationStore,
    private router: Router
  ) {
    effect(() => {
      const itemAlert = this.itemAlertSignal();
      if (!itemAlert?.item) return;
      this.userService.getUserDetails().subscribe({
        next: () => {
          const { item, alertId } = itemAlert;

          if (alertId) {
            const alerts = this.alertsStore.alerts();
            const isLoading = this.alertsStore.loading();

            if (isLoading && alerts.length === 0) {
              return;
            }

            this.alertDetails =
              alerts.find((alert) => alert.id === alertId) || null;
          } else {
            this.alertDetails = null;
          }

          this.showAlertModal = true;
          this.itemDetails = item;
          this.alertId = alertId || null;
          this.itemAlertSignal.set(null);
        },
        error: () => {
          this.authenticationStore.clearAuth();
          this.router.navigate(['/login']);
        },
      });
    });
  }
  ngOnInit() {
    this.store.loadStores();
    this.category.loadCategories([]);
    this.itemsStore.getItems();
    this.alertsStore.loadAlerts();
  }
  closeAlertModal() {
    this.showAlertModal = false;
    this.itemAlert = null;
    this.alertDetails = null;
    this.alertId = null;
    this.itemDetails = null;
  }

  submitAlert() {
    this.itemsStore.getItems();
  }
}
