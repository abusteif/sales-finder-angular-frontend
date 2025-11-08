import { Component, effect } from '@angular/core';
import { storesStore } from '../../../state/stores.store';
import { CategoriesStore } from '../../../state/categories.store';
import { ItemsStore } from '../../../state/items.store';
import { FilterStore } from '../../../state/filter.store';
import { SortService } from '../../../core/services/sort.service';
import { SortOption } from '../../../core/models/sort.model';
import { FilterService } from '../../../core/services/filter.service';
import { DATE_RANGE_OPTIONS, DEFAULT_FILTER_VALUES, DEFAULT_INCLUDED_UPDATE_TYPES } from '../../../core/constants/filter';
import { DEFAULT_SORT_VALUE, SORT_OPTIONS } from '../../../core/constants/sort';
import { UpdateType } from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';
import { AppStore } from '../../../state/app.store';

@Component({
  selector: 'app-main-top-section',
  standalone: false,
  templateUrl: './main-top-section.component.html',
  styleUrls: ['./main-top-section.component.css'],
})
export class MainTopSectionComponent {
  public stores: string[] = [];
  public selectedStores: string[] = [];
  public categories: string[] = [];
  public selectedCategories: string[] = [];
  public priceRange: number[] = [...environment.maxPriceRange];
  public discountRange: number[] = [...environment.maxDiscountRange];
  public showFilterModal = false;
  public search: string = '';
  public aiSearch: boolean = false;
  public showSortModal = false;
  public sortOptions: SortOption[] = [];
  public dateRange: string = '';
  public isFilterActive: boolean = false;
  public isSortActive: boolean = false;
  public itemsPerPage: number = 0;
  public cardsPerRow: number = 3;
  public includedDiscountTypes: UpdateType[] = [...DEFAULT_INCLUDED_UPDATE_TYPES];
  public isFeaturedItemsOnly: boolean = false;
  public excludeFluctuatingItems: boolean = false;
  constructor(
    public store: storesStore,
    public category: CategoriesStore,
    public items: ItemsStore,
    public filter: FilterStore,
    public sortService: SortService,
    public filterService: FilterService,
    public appStore: AppStore
  ) {

    effect(() => {
      const storeData = this.store.stores();
      this.categories = this.category.categoriesList();
      this.stores = storeData.map(store => store.name);
      this.search = this.filter.search();
      this.itemsPerPage = this.appStore.itemsPerPage();
      this.cardsPerRow = this.appStore.cardsPerRow();
      this.selectedStores = [...this.filter.selectedStores()];
      this.selectedCategories = [...this.filter.selectedCategories()];
      this.priceRange = [...this.filter.selectedPriceRange()];
      this.dateRange = this.filter.dateRange();
      this.discountRange = [...this.filter.selectedDiscountRange()];
      this.includedDiscountTypes = [...this.filter.includedUpdateTypes()];
      this.isFilterActive = this.checkIfFilterActive()
      this.isFeaturedItemsOnly = this.filter.featuredItemsOnly();
      this.excludeFluctuatingItems = this.filter.excludeFluctuatingItems();
      const defaultSortOption = this.sortService.processSortOption(DEFAULT_SORT_VALUE?.value || '');
      this.isSortActive = this.filter.sortBy() !== defaultSortOption.sortBy ||
        this.filter.sortOrder() !== defaultSortOption.sortOrder;
    });
  }

  onStoreChange(selectedStores: string[]) {
    this.selectedStores = selectedStores;
  }

  onCategoryChange(selectedCategories: string[]) {
    this.selectedCategories = selectedCategories;
  }

  onPriceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
  }

  onDiscountRangeChange(discountRange: number[]) {
    this.discountRange = discountRange;
  }

  onDateRangeChange(dateRange: string) {
    this.dateRange = dateRange;
  }

  onSearchChange(search: string) {
    this.search = search;
    this.filter.setSearch(search);
    this.store.loadStores();
    this.getItemsAndResetPage();
  }

  onAiSearchChange(aiSearch: boolean) {
    this.aiSearch = aiSearch;
    this.filter.setAiSearch(aiSearch);
  }

  onRefreshClick() {
    this.store.loadStores();
    this.getItemsAndResetPage();
  }

  onSubmitFilter() {
    this.filter.setSelectedStores(this.selectedStores);
    this.filter.setSelectedCategories(this.selectedCategories);
    this.filter.setSelectedPriceRange(this.priceRange);
    this.filter.setSelectedDiscountRange(this.discountRange);
    this.filter.setDateRange(this.dateRange);
    this.filter.updateIncludedUpdateType(this.includedDiscountTypes);
    this.filter.setFeaturedItemsOnly(this.isFeaturedItemsOnly);
    this.filter.setExcludeFluctuatingItems(this.excludeFluctuatingItems);
    this.getItemsAndResetPage();
    this.closeFilterModal();
  }

  onSortChange(sortOption: string) {
    const sortCriteria = this.sortService.processSortOption(sortOption);
    this.filter.setSortBy(sortCriteria.sortBy);
    this.filter.setSortOrder(sortCriteria.sortOrder);
  }

  onApplySort() {
    this.filter.setCurrentPage(1);
    this.getItemsAndResetPage();
    this.closeSortModal();
  }

  onIncludeNewItemsChange(includeNewItems: boolean) {
    this.updateIncludedDiscountTypes(UpdateType.NEW, includeNewItems);
  }
  onIncludeDiscountUpItemsChange(includeDiscountUpItems: boolean) {
    this.updateIncludedDiscountTypes(UpdateType.DISCOUNT_UP, includeDiscountUpItems);
  }
  onIncludeDiscountDownItemsChange(includeDiscountDownItems: boolean) {
    this.updateIncludedDiscountTypes(UpdateType.DISCOUNT_DOWN, includeDiscountDownItems);
  }
  onIncludeReturnedItemsChange(includeReturnedItems: boolean) {
    this.updateIncludedDiscountTypes(UpdateType.RETURNED, includeReturnedItems);
  }
  onFeaturedItemsChange(featuredItemsOnly: boolean, fromControlRibbon: boolean = false) {
    this.isFeaturedItemsOnly = featuredItemsOnly;
    if (fromControlRibbon) {
      this.filter.setFeaturedItemsOnly(featuredItemsOnly);
      this.getItemsAndResetPage();
    }
  }
  onExcludeFluctuatingItemsChange(excludeFluctuatingItems: boolean) {
    this.excludeFluctuatingItems = excludeFluctuatingItems;
  }

  updateIncludedDiscountTypes(type: UpdateType, value: boolean) {
    if (value) {
      this.includedDiscountTypes = [...this.includedDiscountTypes, type];
    } else {
      this.includedDiscountTypes = this.includedDiscountTypes.filter(t => t !== type);
    }
  }

  openFilterModal() {
    this.showFilterModal = true;
  }

  onItemsPerPageChange(itemsPerPage: number) {
    this.appStore.setItemsPerPage(itemsPerPage);
  }

  onCardsPerRowChange(cardsPerRow: number) {
    this.appStore.setCardsPerRow(cardsPerRow);
    this.getItemsAndResetPage();
  }

  checkIfFilterActive() {
    return JSON.stringify(this.selectedStores) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedStores) ||
      JSON.stringify(this.selectedCategories) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedCategories) ||
      JSON.stringify(this.priceRange) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedPriceRange) ||
      JSON.stringify(this.discountRange) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedDiscountRange) ||
      JSON.stringify(this.includedDiscountTypes.sort()) !== JSON.stringify(DEFAULT_INCLUDED_UPDATE_TYPES.sort()) ||
      this.dateRange !== DEFAULT_FILTER_VALUES.selectedDateRange;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  openSortModal() {
    this.showSortModal = true;
  }

  closeSortModal() {
    this.showSortModal = false;
  }

  getSortOptions() {
    return this.sortOptions = [...SORT_OPTIONS];
  }

  getItemsAndResetPage() {
    this.filter.setCurrentPage(1);
    this.items.getItems();
  }

  onResetFilters() {
    this.selectedStores = [...DEFAULT_FILTER_VALUES.selectedStores];
    this.selectedCategories = [...DEFAULT_FILTER_VALUES.selectedCategories];
    this.priceRange = [...DEFAULT_FILTER_VALUES.selectedPriceRange];
    this.discountRange = [...DEFAULT_FILTER_VALUES.selectedDiscountRange];
    this.dateRange = DEFAULT_FILTER_VALUES.selectedDateRange;
    this.includedDiscountTypes = [...DEFAULT_INCLUDED_UPDATE_TYPES];
  }

  onDisplaySettingsClick() {
    // This method can be used for any additional logic when display settings button is clicked
    // The modal is handled by the home-controls-ribbon component
  }

  onDisplaySettingsChange(settings: { itemsPerPage: number, cardsPerRow: number }) {
    this.appStore.setItemsPerPage(settings.itemsPerPage);
    this.appStore.setCardsPerRow(settings.cardsPerRow);
    this.getItemsAndResetPage();
  }

  onDisplaySettingsApply() {
    this.getItemsAndResetPage();
  }
}
