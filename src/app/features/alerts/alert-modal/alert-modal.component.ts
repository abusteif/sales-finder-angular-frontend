import { Component, EventEmitter, Input, Output, OnInit, effect } from '@angular/core';
import { AdditionalButton } from '../../../core/models/modal.model';
import { Alert } from '../../../core/models/alert.model';
import { Store } from '../../../core/models/store.model';
import { environment } from '../../../../environments/environment';
import { alertConstants } from '../../../core/constants/alert';
import { AlertsStore } from '../../../state/alerts.store';
import { User } from '../../../core/models/user.models';
import { Item } from '../../../core/models/item.model';


@Component({
  selector: 'app-alert-modal',
  standalone: false,
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.css'
})
export class AlertModalComponent {
  @Input() showAlertModal = false;
  @Input() title = 'Create Alert';
  @Input() set user(user: User | null) {
    this.maxStoresPerAlert = user?.maxStoresPerAlert || 0;
  }
  @Input() set stores(stores: Store[]) {
    this.storeNames = stores.map(store => store.name);
  }
  _existingItemDetails: Item | null = null;
  @Input() set existingItemDetails(item: Item | null) {
    this._existingItemDetails = item || null;
    if (this._existingItemDetails) {
      this.itemName = this._existingItemDetails.name;
    }
  }
  get existingItemDetails(): Item | null {
    return this._existingItemDetails;
  }

  @Input() set alert(alert: Alert | null) {
    if (alert) {
      this.alertId = alert.id || '';
      this.itemName = alert.item || '';
      this.aiSearch = alert.aiSearch;
      this.exactMatch = alert.exactMatch;
      this.selectedStores = alert.stores;
      this.priceRange = [alert.minPrice || 0, alert.maxPrice || environment.maxPriceRange[1]];
      this.minDiscount = alert.minDiscount;
      this.alertType = alert.alertType;
      this.isNewAlert = false;
    }
  }

  @Output() onCloseModal = new EventEmitter<void>();
  @Output() onSubmitAlert = new EventEmitter<Alert | null>();
  currentStep = 1;
  totalSteps = 4;
  stepsArray = Array.from({ length: 4 }, (_, i) => i + 1);
  additionalButton: AdditionalButton | null = {
    text: 'Back',
    isDisabled: false
  };
  alertId: string = '';
  itemName = '';
  aiSearch = false;
  exactMatch = false;
  storeNames: string[] = [];
  selectedStores: string[] = [];
  priceRange: number[] = [...environment.maxPriceRange];
  minDiscount: number = 0.5;
  alertType: string = 'email';
  minCharacterLimit = alertConstants.minCharacterLimit;
  maxCharacterLimit = alertConstants.maxCharacterLimit;
  maxStoresPerAlert = 0;
  isNewAlert = true;
  creatingAlert = false;
  updatingAlert = false;
  newAlert: Alert | null = null;
  constructor(
    private alertsStore: AlertsStore
  ) { 
    effect(() => {
      const isCreating = this.alertsStore.creating();
      const error = this.alertsStore.error();
      if (this.creatingAlert && !isCreating) {
        this.creatingAlert = false;
        if (!error) {
          this.onSubmitAlert.emit(this.newAlert);
        }
        this.closeAlertModal();
      }
   });
   effect(() => {
    const isUpdating = this.alertsStore.updating();
    const error = this.alertsStore.error();
    if (this.updatingAlert && !isUpdating) {
      this.updatingAlert = false;
      if (!error) {
        this.onSubmitAlert.emit(this.newAlert);
      }
      this.closeAlertModal();
    }
  })
  }


  onStoreChange(selectedStores: string[]) {
    this.selectedStores = selectedStores;
  }

  onPriceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
  }

  onMinDiscountChange(minDiscount: number) {
    this.minDiscount = minDiscount;
  }

  closeAlertModal() {
    this.onCloseModal.emit();
    this.resetModal();
  }

  resetModal() {
    this.currentStep = 1;
    this.itemName = '';
    this.aiSearch = false;
    this.exactMatch = false;
    this.selectedStores = [];
    this.priceRange = [...environment.maxPriceRange];
    this.minDiscount = 0.5;
    this.alertType = 'email';
    this.isNewAlert = true;
    this.alertId = '';
    this._existingItemDetails = null;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      if (this.existingItemDetails) {
        if (this.currentStep === 1) {
          this.currentStep = 3
          this.selectedStores = [this.existingItemDetails.store]
          return;
        }
      }

      
      this.currentStep++;
      
    } else if (this.currentStep === this.totalSteps) {
      this.newAlert = {
        id: this.alertId,
        item: this.existingItemDetails ? this.existingItemDetails.name : this.itemName,
        aiSearch: this.aiSearch,
        exactMatch: this.exactMatch,
        stores: this.selectedStores,
        minPrice: this.priceRange[0],
        minDiscount: this.minDiscount,
        isActive: true,
        alertType: this.alertType || 'EMAIL',
      }
      if (this.existingItemDetails) {
        this.newAlert.url = this.existingItemDetails.url;
      }
      if (this.priceRange[1] !== environment.maxPriceRange[1]) {
        this.newAlert.maxPrice = this.priceRange[1];
      }
      this.alertId ? this.onUpdateAlert(this.newAlert) : this.onCreateAlert(this.newAlert);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      if (this.existingItemDetails) {
        if (this.currentStep === 3) {
          this.currentStep = 1
          return;
        }
      }
      this.currentStep--;
    }
  }

  navigateToStep(step: number) {
    if (this.canNavigateToStep(step)) {
      this.currentStep = step;
    }
  }

  canNavigateToStep(step: number): boolean {

    if (this.existingItemDetails) {
      if (step === 2 ) {
        return false;
      }
    }
    if (step <= this.currentStep) {
      return true;
    }
    // Can navigate to next step if current step is valid
    if (step === this.currentStep + 1) {
      return this.canProceed();
    }
    
    return false;
  }

  onItemNameChange(event: any) {
    this.itemName = event;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        if (this.existingItemDetails) {
          return true;
        }
        return this.itemName.trim().length > 0 && this.itemName.length < this.maxCharacterLimit && this.itemName.length >= this.minCharacterLimit;
      case 2:
        return this.selectedStores.length > 0 && this.selectedStores.length <= this.maxStoresPerAlert;
      case 3:
        // User can proceed with default price range and discount
        return true;
      default:
        return true;
    }
  }

  submitAlertText(): string {
    let buttonText = '';
    if (this.currentStep === this.totalSteps) {
      buttonText = this.alertId ? 'Update Alert' : 'Create Alert';
    } else {
      buttonText = 'Next';
    }
    return buttonText;
  }

  getApplyButtonDisabled(): boolean {
    return !this.canProceed();
  }

  onAdditionalButtonClick() {
    this.previousStep();
  }

  onExactMatchChange(event: boolean) {
    this.exactMatch = event;
  }

  onAiSearchChange(event: boolean) {
    this.aiSearch = event;
  }

  onEnterKey() {
    // Just dismiss the keyboard, user needs to configure switches first
    const input = document.querySelector('.item-name-input') as HTMLInputElement;
    if (input) {
      input.blur();
    }
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'What are you looking for?';
      case 2:
        return 'Choose a store';
      case 3:
        return 'Set your preferences';
      case 4:
        return this.isNewAlert ? 'Review & Create' : 'Review & Update';
      default:
        return 'Create Alert';
    }
  }

  getStepDescription(): string {
    switch (this.currentStep) {
      case 1:
        return 'Enter the name of the item you want to track';
      case 2:
        return 'Select a store to monitor';
      case 3:
        return 'Configure your alert preferences like price range and discount percentage.';
      case 4:
        return 'Review your alert settings and create the alert.';
      default:
        return '';
    }
  }

  onUpdateAlert(alert: Alert) {
    this.updatingAlert = true;
    if (this.priceRange[1] !== environment.maxPriceRange[1]) {
      alert.maxPrice = this.priceRange[1];
    }
    this.alertsStore.updateAlert(alert);
  }

    onCreateAlert(alert: Alert) {
    this.creatingAlert = true;
    this.alertsStore.createAlert(alert);
  }
}
