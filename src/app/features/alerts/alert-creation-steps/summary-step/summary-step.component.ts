import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from '../../../../core/models/item.model';

@Component({
  selector: 'app-summary-step',
  standalone: false,
  templateUrl: './summary-step.component.html',
  styleUrl: './summary-step.component.css'
})
export class SummaryStepComponent {
  @Input() searchText = '';
  @Input() selectedStores: string[] = [];
  @Input() priceRange: number[] = [];
  @Input() minDiscount = 0;
  @Input() exactMatch = false;
  @Input() aiSearch = true;
  @Input() isNewAlert = true;
  @Input() url = '';
  @Input() imageUrl = '';
  // Computed properties for display
  get stores(): string[] {
    return this.selectedStores.length > 0 ? this.selectedStores : ['All stores'];
  }

  get minPrice(): number {
    return this.priceRange[0] || 0;
  }

  get maxPrice(): number {
    return this.priceRange[1] || 0;
  }

  get alertType(): string {
    return 'Price Drop Alert';
  }

}
