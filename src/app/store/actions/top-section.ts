import { createAction } from '@ngrx/store';
import { SaleItem } from '../../models/sale-item.model';

export const getStores = createAction(
    '[TopSection Component] Get Stores',
  );

export const storesLoaded = createAction(
    '[TopSection Component] Stores Loaded',
    (stores: string[]) => ({ stores })
  );

  export const getCategories = createAction(
    '[TopSection Component] Get Categories',
    (store: string) => ({ store })
  );

  export const categoriesLoaded = createAction(
    '[TopSection Component] Categories Loaded',
    (categories: string[]) => ({ categories })
  );

  export const getItems = createAction(
    '[TopSection Component] Get Items',
    (store: string, category: string) => ({ store, category })
    
  );
  export const itemsLoaded = createAction(
    '[TopSection Component] Items Loaded',
    (items: SaleItem[]) => ({ items })
    
  );
export const setPriceRange = createAction(
  '[TopSection Component] Set Price Range',
  (priceRange: number[]) => ({ priceRange })
);
export const setDiscountRange = createAction(
  '[TopSection Component] Set Discount Range',
  (discountRange: number[]) => ({ discountRange })
);
export const selectStore = createAction(
  '[TopSection Component] Select Store',
  (store: string) => ({ store })
);
export const selectCategory = createAction(
  '[TopSection Component] Select Category',
  (category: string) => ({ category })
);
export const setSearchTerm = createAction(
  '[TopSection Component] Set Search Term',
  (searchTerm: string) => ({ searchTerm })
);
