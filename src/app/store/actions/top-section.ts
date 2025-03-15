import { createAction } from '@ngrx/store';

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
