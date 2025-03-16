import { createReducer, on } from '@ngrx/store';
import {
  setPriceRange,
  setDiscountRange,
  setSearchTerm,
  selectCategory,
  selectStore,
  getStores,
  storesLoaded,
  categoriesLoaded,
  itemsLoaded,
} from '../actions/top-section';
import { SaleItem } from '../../models/sale-item.model';

export interface TopSectionState {
  stores: string[];
  categories: string[];
  items: SaleItem[];
  priceRange: number[];
  discountRange: number[];
  searchTerm: string;
  selectedCategory: string;
  selectedStore: string;
  loading: boolean;
}
export const initialState = {
  stores: [""],
  categories: [""],
  items: [{}],
  priceRange: [0, 1000],
  discountRange: [0, 100],
  searchTerm: '',
  selectedCategory: '',
  selectedStore: '',
  loading: false,
};

export const topSectionReducer = createReducer(
  initialState,
  on(getStores, (state) => ({ ...state, loading: true })),
  on(storesLoaded, (state, { stores }) => ({
    ...state,
    loading: false,
    stores,
  })),
  on(categoriesLoaded, (state, { categories }) => ({
    ...state,
    loading: false,
    categories,
  })),

  on(itemsLoaded, (state, { items }) => ({
    ...state,
    loading: false,
    items,
  })),

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
