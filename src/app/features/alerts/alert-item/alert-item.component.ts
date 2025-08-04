import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Alert } from '../../../core/models/alert.model';
import { Store } from '../../../core/models/store.model';
import { environment } from '../../../../environments/environment';
import { StatusDialogService } from '../../../core/services/status-dialog.service';

@Component({
  selector: 'app-alert-item',
  standalone: false,
  templateUrl: './alert-item.component.html',
  styleUrl: './alert-item.component.css'
})
export class AlertItemComponent {
  private _alert: Alert = {} as Alert;
  isActive = false;
  isLoading = false;

  // Processed data for sub-components
  searchText = '';
  selectedStores: string[] = [];
  minPrice = 0;
  maxPrice = 0;
  minDiscount = 0;
  alertType = '';
  exactMatch = false;
  aiSearch = true;
  lastItemFound = '';
  lastItemFoundAt: Date | null = null;
  lastItemFoundUrl = '';
  lastItemFoundImageUrl = '';

  @Output() toggleAlert = new EventEmitter<Alert>();
  @Output() editAlert = new EventEmitter<Alert>();
  @Output() deleteAlert = new EventEmitter<string>();

  @Input() stores: Store[] = [];
  @Input() set alert(alert: Alert) {
    this._alert = alert;
    this.isActive = alert.isActive;
    
    // Process data for sub-components
    this.searchText = alert.item || 'ALL ITEMS';
    this.selectedStores = alert.stores
    this.minPrice = alert.minPrice;
    this.maxPrice = alert.maxPrice || environment.maxPriceRange[1];
    this.minDiscount = alert.minDiscount;
    this.alertType = alert.alertType;
    this.exactMatch = alert.exactMatch;
    this.aiSearch = alert.aiSearch;
    this.lastItemFound = alert.lastItemFound || '';
    this.lastItemFoundAt = alert.lastItemFoundAt || null;
    this.lastItemFoundUrl = alert.lastItemFoundUrl || '';
    this.lastItemFoundImageUrl = alert.lastItemFoundImageUrl || '';
  }
  get alert(): Alert {
    return this._alert;
  }

  constructor(private statusDialogService: StatusDialogService) {}

  onToggleAlert(): void {
    this.toggleAlert.emit(this.alert);
  }

  onEditAlert(): void {
    this.editAlert.emit(this.alert);
  }

  onDeleteAlert(): void {
    this.statusDialogService.showConfirmation(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      'Delete',
      'Cancel'
    ).subscribe((result) => {
      if (result) {
        this.deleteAlert.emit(this.alert.id);
      }
    });
  }
}
