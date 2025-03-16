import { Component } from '@angular/core';
import { SliderComponent } from '../slider/slider.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { Picker } from '../../models/top-section.models';
import { SectionComponent } from '../../shared/section/section.component';
import {
  selectStore,
  getStores,
  getCategories,
  getItems,
} from '../../store/actions/top-section';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import {
  selectedStore,
  stores,
  categories,
  items
} from '../../store/selectors/top-section';
import { AsyncPipe } from '@angular/common';
import { SaleItem } from '../../models/sale-item.model';
import { JsonPipe } from '@angular/common';
@Component({
  selector: 'app-top-section',
  imports: [SliderComponent, DropdownComponent, SectionComponent, AsyncPipe, JsonPipe],
  templateUrl: './top-section.component.html',
  styleUrl: './top-section.component.css',
})
export class TopSectionComponent {
  stores: Picker[] = [];
  selectedStore;
  categories: Picker[] = [{ name: 'Toys', code: 'toys' }];
  items: SaleItem[] = [];

  constructor(private store: Store<AppState>) {
    this.selectedStore = this.store.select(selectedStore);
  }

  onStoreSelected(store: string) {
    this.store.dispatch(selectStore(store));
    this.store.dispatch(getCategories(store));
    this.store.select(categories).subscribe((categories) => {
      this.categories = categories.map((category) => ({
        name: category,
        code: category,
      }));
    });
  }

  onCategorySelected(category: string) {
    this.selectedStore.subscribe(store => {
      this.store.dispatch(getItems(store, category));
    });
    this.store.select(items).subscribe((items) => {
      this.items = items;
    });
  }

  ngOnInit() {
    this.store.dispatch(getStores());
    this.store.select(stores).subscribe((stores) => {
      this.stores = stores.map((store) => ({ name: store, code: store }));
    });
  }
}
