import { Component, effect } from '@angular/core';
import { storesStore } from '../../../state/stores.store';
import { CategoriesStore } from '../../../state/categories.store';
import { ItemsStore } from '../../../state/items.store';
import { FilterStore } from '../../../state/filter.store';
import { SortService } from '../../../core/services/sort.service';
import { SortOption } from '../../../core/models/sort.model';
import { FilterService } from '../../../core/services/filter.service';
import { DATE_RANGE_OPTIONS, DEFAULT_FILTER_VALUES } from '../../../core/constants/filter';
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
  public dateRange: number = 0;
  public isFilterActive: boolean = false;
  public isSortActive: boolean = false;
  public dateRangeString: string = '';
  public itemsPerPage: number = 0;
  constructor(
    public store: storesStore,
    public category: CategoriesStore,
    public items: ItemsStore,
    public filter: FilterStore,
    public sortService: SortService,
    public filterService: FilterService,
    public appStore: AppStore
  ) {

    // Create an effect to react to store changes
    effect(() => {
      const storeData = this.store.stores();
      this.categories = this.category.categoriesList();
      this.stores = storeData.map(store => store.name);
      this.search = this.filter.search();
      this.itemsPerPage = this.appStore.itemsPerPage();
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
    this.selectedStores = selectedStores;
  }

  onCategoryChange(selectedCategories: string[]) {
    console.log('Selected category:', selectedCategories);
    this.selectedCategories = selectedCategories;
  }

  onPriceRangeChange(priceRange: number[]) {
    this.priceRange = priceRange;
  }

  onDiscountRangeChange(discountRange: number[]) {
    this.discountRange = discountRange;
  }

  onDateRangeChange(dateRange: string) {
    this.dateRange = this.filterService.getDateRange(dateRange);
    this.dateRangeString = dateRange;
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

  onItemsPerPageChange(itemsPerPage: number) {
    this.appStore.setItemsPerPage(itemsPerPage);
    this.getItemsAndResetPage();
  }

  closeFilterModal() {
    this.selectedStores = [...this.filter.selectedStores()];
    this.selectedCategories = [...this.filter.selectedCategories()];
    this.priceRange =[...this.filter.selectedPriceRange()];
    this.discountRange = [...this.filter.selectedDiscountRange()];
    this.dateRange = this.filter.dateRange();
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
  }
}
