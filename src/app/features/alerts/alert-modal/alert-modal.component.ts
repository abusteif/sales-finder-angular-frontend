import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { AdditionalButton } from '../../../core/models/modal.model';
import { Alert } from '../../../core/models/alert.model';
import { Store } from '../../../core/models/store.model';
import { environment } from '../../../../environments/environment';
import { alertConstants } from '../../../core/constants/alert';
import { AlertsStore } from '../../../state/alerts.store';
import { User } from '../../../core/models/user.models';


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
  constructor(
    private alertsStore: AlertsStore
  ) { }


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
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else if (this.currentStep === this.totalSteps) {
      const alert: Alert = {
        id: this.alertId,
        item: this.itemName,
        aiSearch: this.aiSearch,
        exactMatch: this.exactMatch,
        stores: this.selectedStores,
        minPrice: this.priceRange[0],
        minDiscount: this.minDiscount,
        isActive: true,
        alertType: this.alertType || 'EMAIL'
      }
      if (this.priceRange[1] !== environment.maxPriceRange[1]) {
        alert.maxPrice = this.priceRange[1];
      }
      this.alertId ? this.onUpdateAlert(alert) : this.onCreateAlert(alert);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  navigateToStep(step: number) {
    if (this.canNavigateToStep(step)) {
      this.currentStep = step;
    }
  }

  canNavigateToStep(step: number): boolean {
    // Can always navigate to completed steps or the next available step
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
    if (this.priceRange[1] !== environment.maxPriceRange[1]) {
      alert.maxPrice = this.priceRange[1];
    }
    this.alertsStore.updateAlert(alert);
    this.closeAlertModal();
  }

    onCreateAlert(alert: Alert) {
    this.alertsStore.createAlert(alert);
    this.closeAlertModal();
  }
}
