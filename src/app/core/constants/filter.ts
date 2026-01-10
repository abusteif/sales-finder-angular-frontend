import { UpdateType } from "../models/item.model";

export const DEFAULT_DATE_RANGE = 'All time';
export const DEFAULT_INCLUDED_UPDATE_TYPES: UpdateType[] = [UpdateType.NEW, UpdateType.DISCOUNT_UP, UpdateType.RETURNED];

export const DEFAULT_FILTER_VALUES = {
  selectedStores: [],
  selectedCategories: [],
  selectedPriceRange: [1, 1000000],
  selectedDiscountRange: [1, 100],
  selectedDateRange: DEFAULT_DATE_RANGE,
  includedUpdateTypes: [...DEFAULT_INCLUDED_UPDATE_TYPES],
  featuredItemsOnly: false,
  excludeFluctuatingItems: false,
  lowestPriceEver: false
}   

export const DATE_RANGE_OPTIONS = ['Last hour', 'Today', 'This week', 'All time'];
