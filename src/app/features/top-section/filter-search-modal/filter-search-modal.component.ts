import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AdditionalButton } from '../../../core/models/modal.model';

@Component({
  selector: 'app-filter-search-modal',
  standalone: false,
  templateUrl: './filter-search-modal.component.html',
  styleUrl: './filter-search-modal.component.css'
})
export class FilterSearchModalComponent {
  @Input() stores: string[] = [];
  @Input() categories: string[] = [];
  @Input() showFilterModal: boolean = false;

  @Output() onSubmitFilter = new EventEmitter<any>();
  @Output() onCloseFilterModal = new EventEmitter<void>();
  @Output() onStoreChange = new EventEmitter<string[]>();
  @Output() onCategoryChange = new EventEmitter<string[]>();
  @Output() onPriceRangeChange = new EventEmitter<number[]>();
  @Output() onDiscountRangeChange = new EventEmitter<number[]>();
  @Output() onDateRangeChange = new EventEmitter<string>();

  selectedStores: string[] = [];
  selectedCategory: string[] = [];
  maxPrice: number = environment.maxPriceRange[1];
  maxDiscount: number = environment.maxDiscountRange[1];
  minPrice: number = environment.maxPriceRange[0];
  minDiscount: number = environment.maxDiscountRange[0];
  priceRange: number[] = [...environment.maxPriceRange];
  discountRange: number[] = [...environment.maxDiscountRange];
  dateRangeOptions: string[] = ['Last hour', 'Today', 'This week', 'All time'];
  dateRange: string = '';
  resetFiltersButton: AdditionalButton = { text: 'Reset Filters', isDisabled: true };

  filterForm: FormGroup = new FormGroup({
    stores: new FormControl([]),
    categories: new FormControl([]),
    priceRange: new FormControl([...environment.maxPriceRange]),
    discountRange: new FormControl([...environment.maxDiscountRange]),
  });

  onSubmit() {
    if (this.filterForm.valid) {
      this.onSubmitFilter.emit(
      );
    }
  }

  storeChange(selectedStores: string[]) {
    this.selectedStores = selectedStores;
    this.resetFiltersButton.isDisabled = this.isResetFiltersButtonDisabled();
    this.onStoreChange.emit(this.selectedStores);
  }

  categoryChange(selectedCategories: string[]) {
    this.selectedCategory = selectedCategories;
    this.resetFiltersButton.isDisabled = this.isResetFiltersButtonDisabled();
    this.onCategoryChange.emit(this.selectedCategory);
  }

  priceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
    this.resetFiltersButton.isDisabled = this.isResetFiltersButtonDisabled();
    this.onPriceRangeChange.emit(this.priceRange);
  }

  discountRangeChange(discountRange: number[]) {
    this.discountRange = discountRange;
    this.resetFiltersButton.isDisabled = this.isResetFiltersButtonDisabled();
    this.onDiscountRangeChange.emit(this.discountRange);
  }

  dateRangeChange(dateRange: string) {
    this.dateRange = dateRange;
    this.resetFiltersButton.isDisabled = this.isResetFiltersButtonDisabled();
    this.onDateRangeChange.emit(this.dateRange);
  }



  openFilterModal() {
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
    this.onCloseFilterModal.emit();
  }

  resetFilters() {
    this.selectedStores = [];
    this.selectedCategory = [];
    this.priceRange = [...environment.maxPriceRange];
    this.discountRange = [...environment.maxDiscountRange];
    this.dateRange = '';
  }

  isResetFiltersButtonDisabled() {
    return this.selectedStores.length === 0 && this.selectedCategory.length === 0 && this.priceRange[0] === environment.maxPriceRange[0] && this.priceRange[1] === environment.maxPriceRange[1] && this.discountRange[0] === environment.maxDiscountRange[0] && this.discountRange[1] === environment.maxDiscountRange[1] && this.dateRange === '';
  }


}
