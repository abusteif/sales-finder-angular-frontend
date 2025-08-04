import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-alert-item-details',
  standalone: false,
  templateUrl: './alert-item-details.component.html',
  styleUrl: './alert-item-details.component.css'
})
export class AlertItemDetailsComponent {
  @Output() editAlert = new EventEmitter<void>();
  @Output() deleteAlert = new EventEmitter<void>();

  // Input properties for display data
  @Input() searchText = '';
  @Input() stores: string[] = [];
  @Input() minPrice = 0;
  @Input() set maxPrice(value: number) {
    // sorry about the magical number. If the selected max price is 991 or more we want to display 999+
    this._maxPrice = value > environment.maxPriceRange[1] - 9 ? environment.maxPriceRange[1] : value;
  }
  get maxPrice(): number {
    return this._maxPrice;
  }
  @Input() minDiscount = 0;
  @Input() alertType = '';
  @Input() exactMatch = false;
  @Input() aiSearch = true;
  maxPriceRange = environment.maxPriceRange;
  private _maxPrice = 0;

  onEditAlert(): void {
    this.editAlert.emit();
  }

  onDeleteAlert(): void {
    this.deleteAlert.emit();
  }

  priceRangeDisplay(): string {
    if (this.maxPrice === environment.maxPriceRange[1] && this.minPrice === environment.maxPriceRange[0]) {
      return 'Any price';
    }
    if (this.maxPrice === environment.maxPriceRange[1]) {
      return `From $${this.minPrice}`;
    }
    if (this.minPrice === environment.maxPriceRange[0]) {
      return `Up to $${this.maxPrice}`;
    }
    return `$${this.minPrice} - $${this.maxPrice}`;
  }
}
