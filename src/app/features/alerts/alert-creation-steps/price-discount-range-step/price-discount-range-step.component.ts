import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { discountOptions } from '../../../../core/constants/alert';

@Component({
  selector: 'app-price-discount-range-step',
  standalone: false,
  templateUrl: './price-discount-range-step.component.html',
  styleUrl: './price-discount-range-step.component.css'
})
export class PriceDiscountRangeStepComponent {
  @Input() priceRange: number[] = [...environment.maxPriceRange];
  private _minDiscount: number = 10;
  @Input() set minDiscount(value: number) {
    const validValues = this.discountOptions.map(option => option.value);
    const closestValue = validValues.map(option => {
      return {
        value: option,
        diff: Math.abs(option - value * 100)
      }
    }).sort((a, b) => a.diff - b.diff)[0].value;
    this._minDiscount = closestValue;
  }
  get minDiscount(): number {
    return this._minDiscount;
  }
  
  @Output() priceRangeChange = new EventEmitter<number[]>();
  @Output() minDiscountChange = new EventEmitter<number>();

  // Constants for price slider
  maxPrice: number = environment.maxPriceRange[1];
  minPrice: number = environment.maxPriceRange[0];

  // Discount options array
  discountOptions = discountOptions;

  onPriceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
    this.priceRangeChange.emit(this.priceRange);
  }

  onMinDiscountChange(minDiscount: number) {
    this._minDiscount = minDiscount
    this.minDiscountChange.emit(this._minDiscount / 100);
  }
  
  // Helper method to format discount display
  formatDiscountDisplay(value: number): string {
    if (value === 1) {
      return 'Any discount';
    }
    return `${value}%`;
  }

  get minDiscountDisplay(): string {
    return this.formatDiscountDisplay(this.minDiscount);
  }
  priceRangeDisplay(): string {
    if (this.priceRange[0] === environment.maxPriceRange[0] && this.priceRange[1] >= environment.maxPriceRange[1] - 9) {
      return 'Any price';
    }
    if (this.priceRange[1] >= environment.maxPriceRange[1] - 9) {
      return `From $${this.priceRange[0]}`;
    }
    if (this.priceRange[0] === environment.maxPriceRange[0]) {
      return `Up to $${this.priceRange[1]}`;
    }
    return `$${this.priceRange[0]} - $${this.priceRange[1]}`;
  }

}
