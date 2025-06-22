import { Component, effect } from '@angular/core';
import { storesStore } from '../../../state/stores.store';
import { CategoriesStore } from '../../../state/categories.store';
import { ItemsStore } from '../../../state/items.store';
import { FilterStore } from '../../../state/filter.store';
import { SortService } from '../../../core/services/sort.service';
import { SortOption } from '../../../core/models/sort.model';
import { FilterService } from '../../../core/services/filter.service';
import { DEFAULT_FILTER_VALUES } from '../../../core/constants/filter';
import { DEFAULT_SORT_VALUE, SORT_OPTIONS } from '../../../core/constants/sort';
import { UpdateType } from '../../../core/models/item.model';

@Component({
  selector: 'app-main-top-section',
  standalone: false,
  templateUrl: './main-top-section.component.html',
  styleUrls: ['./main-top-section.component.css'],
})
export class MainTopSectionComponent {
  public stores: string[] = [];
  public categories: string[] = [];
  public priceRange: number[] = [];
  public discountRange: number[] = [];
  public showFilterModal = false;
  public search: string = '';
  public aiSearch: boolean = false;
  public showSortModal = false;
  public sortOptions: SortOption[] = [];
  public dateRange: string = '';
  public isFilterActive: boolean = false;
  public isSortActive: boolean = false;

  constructor(
    public store: storesStore,
    public category: CategoriesStore,
    public items: ItemsStore,
    public filter: FilterStore,
    public sortService: SortService,
    public filterService: FilterService
  ) {

    // Create an effect to react to store changes
    effect(() => {
      const storeData = this.store.stores();
      this.categories = this.category.categoriesList();
      this.stores = storeData.map(store => store.name);
      this.search = this.filter.search();
      this.isFilterActive = JSON.stringify(this.filter.selectedStores()) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedStores) ||
        JSON.stringify(this.filter.selectedCategories()) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedCategories) ||
        JSON.stringify(this.filter.selectedPriceRange()) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedPriceRange) ||
        JSON.stringify(this.filter.selectedDiscountRange()) !== JSON.stringify(DEFAULT_FILTER_VALUES.selectedDiscountRange) ||
        this.filter.dateRange() !== DEFAULT_FILTER_VALUES.selectedDateRange;
      const defaultSortOption = this.sortService.processSortOption(DEFAULT_SORT_VALUE?.value || '');
      this.isSortActive = this.filter.sortBy() !== defaultSortOption.sortBy ||
        this.filter.sortOrder() !== defaultSortOption.sortOrder;
    });

    // effect(() => {
    //   const currentPage = this.filter.currentPage();
    //   if (currentPage !== 1) {
    //     this.items.getItems();
    //   }
    // });
  }

  onStoreChange(selectedStores: string[]) {
    console.log('Selected store:', selectedStores);
    this.filter.setSelectedStores(selectedStores);
  }

  onCategoryChange(selectedCategories: string[]) {
    console.log('Selected category:', selectedCategories);
    this.filter.setSelectedCategories(selectedCategories);
  }

  onPriceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
    this.filter.setSelectedPriceRange(priceRange);
  }

  onDiscountRangeChange(discountRange: number[]) {
    this.discountRange = discountRange;
    this.filter.setSelectedDiscountRange(discountRange);
  }

  onDateRangeChange(dateRange: string) {
    this.dateRange = dateRange;
    this.filter.setDateRange(this.filterService.getDateRange(dateRange));
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

  onNewItemsOnlyChange(newItemsOnly: boolean) {
    this.filter.setUpdateType(newItemsOnly ? UpdateType.NEW : UpdateType.ALL);
    this.getItemsAndResetPage();
  }

  openFilterModal() {
    this.showFilterModal = true;
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
    this.filter.setSelectedStores(DEFAULT_FILTER_VALUES.selectedStores);
    this.filter.setSelectedCategories(DEFAULT_FILTER_VALUES.selectedCategories);
    this.filter.setSelectedPriceRange(DEFAULT_FILTER_VALUES.selectedPriceRange);
    this.filter.setSelectedDiscountRange(DEFAULT_FILTER_VALUES.selectedDiscountRange);
    this.filter.setDateRange(DEFAULT_FILTER_VALUES.selectedDateRange);
    this.getItemsAndResetPage();
    this.showFilterModal = false;
  }
}
