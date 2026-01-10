import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AdditionalButton } from '../../../core/models/modal.model';
import { DATE_RANGE_OPTIONS, DEFAULT_FILTER_VALUES, DEFAULT_INCLUDED_UPDATE_TYPES } from '../../../core/constants/filter';
import { AppStore } from '../../../state/app.store';
import { UpdateType } from '../../../core/models/item.model';

@Component({
  selector: 'app-filter-search-modal',
  standalone: false,
  templateUrl: './filter-search-modal.component.html',
  styleUrls: ['./filter-search-modal.component.css', '../../../shared/icons.css']
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
  @Output() onIncludeNewItemsChange = new EventEmitter<boolean>();
  @Output() onIncludeDiscountUpItemsChange = new EventEmitter<boolean>();
  @Output() onIncludeDiscountDownItemsChange = new EventEmitter<boolean>();
  @Output() onIncludeReturnedItemsChange = new EventEmitter<boolean>();
  @Output() onFeaturedItemsChange = new EventEmitter<boolean>();
  @Output() onExcludeFluctuatingItemsChange = new EventEmitter<boolean>();
  @Output() onLowestPriceEverChange = new EventEmitter<boolean>();

  @Input() selectedStores: string[] = [];
  @Input() selectedCategories: string[] = [];
  @Input() priceRange: number[] = [];
  @Input() discountRange: number[] = [];
  @Input() dateRange: string = DATE_RANGE_OPTIONS.find(option => option === 'All time') || DATE_RANGE_OPTIONS[0];
  @Input() set includedDiscountTypes(includedDiscountTypes: UpdateType[]) {
    this.checkboxes.forEach(checkbox => {
      checkbox.checked = String(includedDiscountTypes).includes(checkbox.name);
    });
  }
  @Input() isFeaturedItemsOnly: boolean = false;
  @Input() excludeFluctuatingItems: boolean = false;
  @Input() isLowestPriceEver: boolean = false;

  maxPrice: number = DEFAULT_FILTER_VALUES.selectedPriceRange[1];
  maxDiscount: number = DEFAULT_FILTER_VALUES.selectedDiscountRange[1];
  minPrice: number = DEFAULT_FILTER_VALUES.selectedPriceRange[0];
  minDiscount: number = DEFAULT_FILTER_VALUES.selectedDiscountRange[0];
  dateRangeOptions: string[] = DATE_RANGE_OPTIONS;
  defaultDateRange = this.dateRange
  resetFiltersButton: AdditionalButton = { text: 'Reset Filters', isDisabled: true };
  dropdownWidth: number = 260;
  dropdownMobileWidth: number = 160;
  UpdateType = UpdateType;
  checkboxes = [
    {
      name: UpdateType.NEW,
      checked: false
    },
    {
      name: UpdateType.DISCOUNT_UP,
      checked: false
    },
    {
      name: UpdateType.DISCOUNT_DOWN,
      checked: false
    },
    {
      name: UpdateType.RETURNED,
      checked: false
    },
    {
      name: UpdateType.HIGHEST_DISCOUNT,
      checked: false
    }
  ];
  @ViewChild('filterFormElement', { static: false }) filterFormElement?: ElementRef<HTMLFormElement>;
  private shouldSubmit: boolean = false;

  constructor(private appStore: AppStore) {}

  filterForm: FormGroup = new FormGroup({
    stores: new FormControl([]),
    categories: new FormControl([]),
    priceRange: new FormControl([...environment.maxPriceRange]),
    discountRange: new FormControl([...environment.maxDiscountRange]),
  });

  onSubmit(event?: Event) {
    // Only submit if explicitly triggered by Apply button, not by Enter key in inputs
    if (!this.shouldSubmit) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    
    this.shouldSubmit = false; // Reset flag
    
    if (this.filterForm.valid) {
      this.onSubmitFilter.emit(
      );
    }
  }

  // This method should be called explicitly by the Apply button
  onApplyButtonClick() {
    this.shouldSubmit = true;
    this.onSubmit();
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
  isMobileDevice(): boolean {
    return this.appStore.isMobile();
  }
  getDropdownWidth(): number {
    if (this.isMobileDevice()) {
      return this.dropdownMobileWidth;
    }
    return this.dropdownWidth;
  }

  handleIncludeNewItemsChange(checked: boolean) {
    this.onIncludeNewItemsChange.emit(checked);
  }

  handleIncludeDiscountUpItemsChange(checked: boolean) {
    this.onIncludeDiscountUpItemsChange.emit(checked);
  }

  handleIncludeDiscountDownItemsChange(checked: boolean) {
    this.onIncludeDiscountDownItemsChange.emit(checked);
  }

  handleIncludeReturnedItemsChange(checked: boolean) {
    this.onIncludeReturnedItemsChange.emit(checked);
  }

  handleFeaturedItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.onFeaturedItemsChange.emit(checkbox.checked);
  }

  handleExcludeFluctuatingItemsChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.onExcludeFluctuatingItemsChange.emit(checkbox.checked);
  }

  handleLowestPriceEverChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.onLowestPriceEverChange.emit(checkbox.checked);
  }

  isCheckboxChecked(name: UpdateType) {
    return this.checkboxes.find(checkbox => checkbox.name === name)?.checked ?? false;
  }
}
