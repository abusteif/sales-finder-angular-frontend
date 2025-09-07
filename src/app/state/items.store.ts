import { inject, Injectable } from "@angular/core";
import { Item, ItemsAPIResponse, UpdateType } from "../core/models/item.model";
import { ItemsService } from "../core/services/items.service";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { catchError, of, tap } from "rxjs";
import { FilterStore } from "./filter.store";
import { environment } from "../../environments/environment";
import { AppStore } from "./app.store";
import { DEFAULT_DATE_RANGE } from "../core/constants/filter";
import { FilterService } from "../core/services/filter.service";

interface ItemConditions {
  stores?: string[];
  categories?: string[];
  priceRange?: number[];
  discountRange?: number[];
  pageNumber: number;
  itemsPerPage: number;
  searchQuery?: string;
  searchType?: string;
  sortBy?: string;
  sortOrder?: string;
  dateRange?: number;
  updateType?: UpdateType;
  highestDiscountOnly?: boolean;
}

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  itemsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsStore extends signalStore(
  { providedIn: 'root' },
  withState<ItemsState>({
    items: [],
    loading: false,
    error: null,
    itemsCount: 0
  }),
  withMethods((items) => {
    const itemsService = inject(ItemsService);        
    const filter = inject(FilterStore);
    const appStore = inject(AppStore);
    const filterService = inject(FilterService);
    return {
      getItems: () => {

        const selectedStores = filter.selectedStores();
        const selectedCategories = filter.selectedCategories(); 
        let conditions: ItemConditions = {
          pageNumber: filter.currentPage(),
          itemsPerPage: appStore.itemsPerPage(),
        }
        if (selectedStores.length !== 0) {
          conditions = {
            ...conditions,
            stores: selectedStores
          }
        }
        if (selectedCategories.length !== 0) {
          conditions = {
            ...conditions,
            categories: selectedCategories
          }
        }
        if(filter.selectedPriceRange()[0] !== environment.maxPriceRange[0] || filter.selectedPriceRange()[1] !== environment.maxPriceRange[1]) {
          conditions = {
            ...conditions,
            priceRange: filter.selectedPriceRange()
          }
        } 
        if (filter.selectedPriceRange()[1] === environment.maxPriceRange[1]) {
          const newPriceRange = [filter.selectedPriceRange()[0], 999999999];
          conditions = {
            ...conditions,
            priceRange: newPriceRange
          }
        }
        if(filter.selectedDiscountRange()[0] !== environment.maxDiscountRange[0] || filter.selectedDiscountRange()[1] !== environment.maxDiscountRange[1]) {
          conditions = {
            ...conditions,
            discountRange: filter.selectedDiscountRange()
          }
        }
        if(filter.search() !== '') {
          conditions = {
            ...conditions,
            searchQuery: filter.search(),
            searchType: filter.aiSearch() ? 'semantic search' : 'word matching'
          }
        }
        if(filter.sortBy() !== '' && filter.sortOrder() !== '') {
          conditions = {
            ...conditions,
            sortBy: filter.sortBy(),
            sortOrder: filter.sortOrder()
          }
        }
        if(filter.dateRange() !== DEFAULT_DATE_RANGE) {
          conditions = {
            ...conditions,
            dateRange: filterService.getDateRange(filter.dateRange())
          }
        }
        if(filter.updateType() !== UpdateType.ALL) {
          conditions = {
            ...conditions,
            updateType: filter.updateType()
          }
        }
        if(filter.highestDiscountOnly()) {
          conditions = {
            ...conditions,
            highestDiscountOnly: filter.highestDiscountOnly()
          }
        }
        patchState(items, { loading: true, error: null, items: [] });
        itemsService.getItems(conditions).pipe(
          tap((result: ItemsAPIResponse) => {
            patchState(items, { items: result.items, itemsCount: result.count, loading: false });
          }),
          catchError((error) => {
            console.log('Failed to load items', error);
            patchState(items, {
              loading: false,
              error: 'Failed to load items',
            });
            return of([]);
          })
        ).subscribe();
      }
    }
  })
) {

}
