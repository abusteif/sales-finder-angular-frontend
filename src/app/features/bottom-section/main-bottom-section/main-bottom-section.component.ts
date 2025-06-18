import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ItemsService } from '../../../core/services/items.service';
import { Item } from '../../../core/models/item.model';
import { ItemsStore } from '../../../state/items.store';
import { Signal, effect } from '@angular/core';
import { FilterStore } from '../../../state/filter.store';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-main-bottom-section',
  standalone: false,
  templateUrl: './main-bottom-section.component.html',
})
export class MainBottomSectionComponent {
  items: Item[] = [];
  isItemsLoading = false;
  itemsError: string | null = null;
  currentPage: number = 1;
  isLastPage: boolean = false;
  constructor(
    private itemsStore: ItemsStore,
    private filterStore: FilterStore
  ) {
    effect(() => {
      this.items = this.itemsStore.items();
      this.currentPage = this.filterStore.currentPage();
      this.isItemsLoading = this.itemsStore.loading();
      this.itemsError = this.itemsStore.error();
      this.isLastPage = this.items.length < environment.itemsPerPage;
    });
  }

  onPageChange(page: number) {
    this.filterStore.setCurrentPage(page);
    this.itemsStore.getItems();
    this.currentPage = this.filterStore.currentPage();
  }

}

