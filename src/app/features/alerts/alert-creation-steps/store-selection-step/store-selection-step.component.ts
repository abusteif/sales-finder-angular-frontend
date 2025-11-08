import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpecialNameTitlecasePipe } from '../../../../shared/special-name-titlecase.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-selection-step',
  standalone: false,
  templateUrl: './store-selection-step.component.html',
  styleUrl: './store-selection-step.component.css'
})
export class StoreSelectionStepComponent {
  _storeNames: string[] = [];
  @Input() selectedStores: string[] = [];
  @Input() maxSelectedOptions: number = 0;
  @Input() set storeNames(storeNames: string[]) {
    this._storeNames = storeNames;
  }
  get storeNames() {
    return this._storeNames;
  }
  @Output() storeChange = new EventEmitter<string[]>();

  constructor(private specialNameTitlecasePipe: SpecialNameTitlecasePipe, private router: Router) {}

  onStoreChange(selectedStores: string[]) {
    this.storeChange.emit(selectedStores);
  }

  storesSummary() {
    return this.selectedStores.length > 0 ? this.selectedStores.map(store => this.specialNameTitlecasePipe.transform(store)).join(', ') : 'Selected stores will be displayed here';
  }

  storeSelectionHint() {
    if (this.storeNames.length >= this.maxSelectedOptions) {
      return 'Select up to ' + this.maxSelectedOptions + ' stores';
    }
    else {
      return 'Select store(s) to monitor';
    }
  }

  onUpgradeClick() {
    // TODO: Implement upgrade functionality
    this.router.navigate(['/upgrade']); 
    // You can emit an event to the parent component to handle the upgrade navigation
  }
  
}
