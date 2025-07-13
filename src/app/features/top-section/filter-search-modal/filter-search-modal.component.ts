import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AdditionalButton } from '../../../core/models/modal.model';
import { DATE_RANGE_OPTIONS, DEFAULT_FILTER_VALUES } from '../../../core/constants/filter';

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
  @Input() set isResetFiltersButtonDisabled(value: boolean) {
    this.resetFiltersButton.isDisabled = value;
  }

  @Output() onSubmitFilter = new EventEmitter<any>();
  @Output() onCloseFilterModal = new EventEmitter<void>();
  @Output() onStoreChange = new EventEmitter<string[]>();
  @Output() onCategoryChange = new EventEmitter<string[]>();
  @Output() onPriceRangeChange = new EventEmitter<number[]>();
  @Output() onDiscountRangeChange = new EventEmitter<number[]>();
  @Output() onDateRangeChange = new EventEmitter<string>();
  @Output() onResetFilters = new EventEmitter<void>();

  @Input() selectedStores: string[] = [];
  @Input() selectedCategories: string[] = [];
  @Input() priceRange: number[] = [];
  @Input() discountRange: number[] = [];
  @Input() dateRange: string = DATE_RANGE_OPTIONS.find(option => option === 'All time') || DATE_RANGE_OPTIONS[0];

  maxPrice: number = environment.maxPriceRange[1];
  maxDiscount: number = environment.maxDiscountRange[1];
  minPrice: number = environment.maxPriceRange[0];
  minDiscount: number = environment.maxDiscountRange[0];
  dateRangeOptions: string[] = DATE_RANGE_OPTIONS;
  defaultDateRange = this.dateRange
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
    this.onStoreChange.emit(this.selectedStores);
  }

  categoryChange(selectedCategories: string[]) {
    this.selectedCategories = selectedCategories;
    this.onCategoryChange.emit(this.selectedCategories);
  }

  priceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
    this.onPriceRangeChange.emit(this.priceRange);
  }

  discountRangeChange(discountRange: number[]) {
    this.discountRange = discountRange;
    this.onDiscountRangeChange.emit(this.discountRange);
  }

  dateRangeChange(dateRange: string) {
    this.dateRange = dateRange;
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
    // this.selectedStores = [...DEFAULT_FILTER_VALUES.selectedStores];
    // this.selectedCategories = [...DEFAULT_FILTER_VALUES.selectedCategories];
    // this.priceRange = [...DEFAULT_FILTER_VALUES.selectedPriceRange];
    // this.discountRange = [...DEFAULT_FILTER_VALUES.selectedDiscountRange];
    // this.dateRange = this.defaultDateRange;
    this.onResetFilters.emit();
  }
}
