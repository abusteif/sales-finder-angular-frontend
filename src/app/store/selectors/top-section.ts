import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';

export const topSection = (state: AppState) => state.topSection;

export const stores = createSelector(
  topSection,
  (state) => state.stores
);

export const categories = createSelector(
  topSection,
  (state) => state.categories
);
export const items = createSelector(
  topSection,
  (state) => state.items
);
export const selectedStore = createSelector(
  topSection,
  (state) => state.selectedStore
);
export const selectedCategory = createSelector(
  topSection,
  (state) => state.selectedCategory
);
export const searchTerm = createSelector(
  topSection,
  (state) => state.searchTerm
);
export const priceRange = createSelector(
  topSection,
  (state) => state.priceRange
);
export const discountRange = createSelector(
  topSection,
  (state) => state.discountRange
);
