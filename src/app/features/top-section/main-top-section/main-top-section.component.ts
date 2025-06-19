import { Component, effect } from '@angular/core';
import { storesStore } from '../../../state/stores.store';
import { CategoriesStore } from '../../../state/categories.store';
import { ItemsStore } from '../../../state/items.store';
import { FilterStore } from '../../../state/filter.store';
import { SortService } from '../../../core/services/sort.service';
import { SortOption } from '../../../core/models/sort.model';
import { FilterService } from '../../../core/services/filter.service';

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
  public selectedSort: string = 'date_desc';
  public dateRange: string = '';
  
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
    });
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
    console.log(search);
    this.search = search;
    this.filter.setSearch(search);
    this.store.loadStores(); 
    this.items.getItems();
  }

  onAiSearchChange(aiSearch: boolean) {
    this.aiSearch = aiSearch;
    this.filter.setAiSearch(aiSearch);
  }

  onRefreshClick() {
    this.store.loadStores(); 
    this.items.getItems();
  }

  onSubmitFilter() {
    this.filter.setCurrentPage(1);
    this.items.getItems();
    this.closeFilterModal();
  }

  onSortChange(sortOption: string) {
    const sortCriteria = this.sortService.processSortOption(sortOption);
    this.selectedSort = sortOption;
    this.filter.setSortBy(sortCriteria.sortBy);
    this.filter.setSortOrder(sortCriteria.sortOrder);
  }

  onApplySort() {
    this.filter.setCurrentPage(1);
    this.items.getItems();
    this.closeSortModal();
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
    return this.sortOptions = this.sortService.getSortOptions(this.aiSearch);
  }
}
