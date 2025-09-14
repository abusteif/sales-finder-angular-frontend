import { Component, effect, signal } from '@angular/core';
import { ItemsStore } from '../../state/items.store';
import { CategoriesStore } from '../../state/categories.store';
import { storesStore } from '../../state/stores.store';
import { Item } from '../../core/models/item.model';
import { itemAlertSignal } from '../../features/item-display/item-card/item-card.component';
@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  showAlertModal = false;
  itemAlertSignal = itemAlertSignal
  itemAlert: Item | null = null
  
  constructor(
    private itemsStore: ItemsStore,
    private store: storesStore,
    private category: CategoriesStore,
  ) {
    effect(() => {
      const item = this.itemAlertSignal()
      if (item) {
        this.showAlertModal = true
        this.itemAlert = item
        this.itemAlertSignal.set(null)
      }
    })
  }
  ngOnInit() {
    this.store.loadStores();
    this.category.loadCategories([]);
    this.itemsStore.getItems();
  }
  closeAlertModal() {
    this.showAlertModal = false;
    this.itemAlert = null;
  }

}
