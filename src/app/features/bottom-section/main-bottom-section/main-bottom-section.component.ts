import { Component, OnInit } from '@angular/core';
import { Item } from '../../../core/models/item.model';
import { ItemsStore } from '../../../state/items.store';
import { effect } from '@angular/core';
import { FilterStore } from '../../../state/filter.store';
import { environment } from '../../../../environments/environment';
import { storesStore } from '../../../state/stores.store';
import { Store } from '../../../core/models/store.model';
import { AppStore } from '../../../state/app.store';

@Component({
  selector: 'app-main-bottom-section',
  standalone: false,
  templateUrl: './main-bottom-section.component.html',
})
export class MainBottomSectionComponent {
  items: Item[] = [];
  itemsCount: number = 0;
  isItemsLoading = false;
  itemsError: string | null = null;
  currentPage: number = 1;
  isLastPage: boolean = false;
  stores: Store[] = [];
  storesCheckedAt: {name: string, checkedAt: Date}[] = [];
  itemsPerPage: number = 0;
  constructor(
    private itemsStore: ItemsStore,
    private filterStore: FilterStore,
    private storesStore: storesStore,
    private appStore: AppStore
  ) {
    effect(() => {
      this.items = this.itemsStore.items();
      this.itemsPerPage = this.appStore.itemsPerPage();
      this.currentPage = this.filterStore.currentPage();
      this.itemsCount = this.itemsStore.itemsCount();
      this.isItemsLoading = this.itemsStore.loading();
      this.itemsError = this.itemsStore.error();
      this.isLastPage = this.itemsCount - this.currentPage * this.itemsPerPage <= this.itemsPerPage;
      this.stores = this.storesStore.stores();
      this.storesCheckedAt = this.stores.map(store => {
        return {
          name: store.name,
          checkedAt: store.checkedAt
        }
      });
    });
  }

  onPageChange(page: number) {
    this.filterStore.setCurrentPage(page);
    this.itemsStore.getItems();
    this.currentPage = this.filterStore.currentPage();
  }

}

