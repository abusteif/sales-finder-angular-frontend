import { createReducer, on } from '@ngrx/store';
import {
  setPriceRange,
  setDiscountRange,
  setSearchTerm,
  selectCategory,
  selectStore,
} from '../actions/top-section';

export interface TopSectionState {
  priceRange: number[];
  discountRange: number[];
  searchTerm: string;
  selectedCategory: string;
  selectedStore: string;
}
export const initialState = {
  priceRange: [0, 1000],
  discountRange: [0, 100],
  searchTerm: '',
  selectedCategory: '',
  selectedStore: '',
};

export const counterReducer = createReducer(
  initialState,
  on(selectStore, (state, { store }) => ({ ...state, selectedStore: store })),
  on(selectCategory, (state, { category }) => ({
    ...state,
    selectedCategory: category,
  })),
  on(setSearchTerm, (state, { searchTerm }) => ({ ...state, searchTerm })),
  on(setPriceRange, (state, { priceRange }) => ({
    ...state,
    priceRange: [...priceRange],
  })),
  on(setDiscountRange, (state, { discountRange }) => ({
    ...state,
    discountRange: [...discountRange],
  }))
);
