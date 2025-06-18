import { Component } from '@angular/core';
import { ItemsStore } from '../../state/items.store';
import { CategoriesStore } from '../../state/categories.store';
import { storesStore } from '../../state/stores.store';

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  constructor(
    private itemsStore: ItemsStore,
    private store: storesStore,
    private category: CategoriesStore,
  ) {}
  ngOnInit() {
    this.store.loadStores();
    this.category.loadCategories([]);
    this.itemsStore.getItems();
  }
}
