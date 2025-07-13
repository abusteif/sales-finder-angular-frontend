import { UpdateType } from "./item.model";

export interface Filter {
    selectedStores: string[];
    selectedCategories: string[];
    selectedPriceRange: number[];
    selectedDiscountRange: number[];
    dateRange: string;
    search: string;
    aiSearch: boolean;
    updateType: UpdateType;
}