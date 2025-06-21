import { Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { SortOption } from "../core/models/sort.model";
import { environment } from "../../environments/environment";
import { UpdateType } from "../core/models/item.model";
import { DEFAULT_FILTER_VALUES } from "../core/constants/filter";
import { DEFAULT_SORT_VALUE } from "../core/constants/sort";
import { SortService } from "../core/services/sort.service";

interface FilterState {
    selectedStores: string[];
    selectedCategories: string[];
    selectedPriceRange: number[];
    selectedDiscountRange: number[];
    currentPage: number;
    search: string;
    aiSearch: boolean;
    sortBy: string;
    sortOrder: string;
    dateRange: number;
    updateType: UpdateType;
}

@Injectable({
    providedIn: 'root'
})
export class FilterStore extends signalStore(
    withState<FilterState>({
        selectedStores: [...DEFAULT_FILTER_VALUES.selectedStores],
        selectedCategories: [...DEFAULT_FILTER_VALUES.selectedCategories],
        selectedPriceRange: [...DEFAULT_FILTER_VALUES.selectedPriceRange],
        selectedDiscountRange: [...DEFAULT_FILTER_VALUES.selectedDiscountRange],
        currentPage: 1,
        search: '',
        aiSearch: false,
        sortBy: '',
        sortOrder: '',
        dateRange: DEFAULT_FILTER_VALUES.selectedDateRange,
        updateType: UpdateType.ALL
    }),
    withMethods((filter) => {
        return {
            setSelectedStores: (selectedStores: string[]) => {
                patchState(filter, { selectedStores });
            },
            setSelectedCategories: (selectedCategories: string[]) => {
                patchState(filter, { selectedCategories });
            },
            setSelectedPriceRange: (selectedPriceRange: number[]) => {
                patchState(filter, { selectedPriceRange });
            },
            setSelectedDiscountRange: (selectedDiscountRange: number[]) => {
                patchState(filter, { selectedDiscountRange });
            },
            setCurrentPage: (currentPage: number) => {
                patchState(filter, { currentPage });
            },
            setSearch: (search: string) => {
                patchState(filter, { search });
            },
            setAiSearch: (aiSearch: boolean) => {
                patchState(filter, { aiSearch });
            },
            setSortBy: (sortBy: string) => {
                patchState(filter, { sortBy });
            },
            setSortOrder: (sortOrder: string) => {
                patchState(filter, { sortOrder });
            },
            setDateRange: (dateRange: number) => {
                patchState(filter, { dateRange });
            },
            setUpdateType: (updateType: UpdateType) => {
                patchState(filter, { updateType });
            }
        }
    })
) {
    constructor(private sortService: SortService) {
        super();
        this.initializeSort();
    }

    private initializeSort() {
        const sortInfo = this.sortService.processSortOption(DEFAULT_SORT_VALUE?.value || '');
        this.setSortBy(sortInfo.sortBy || '');
        this.setSortOrder(sortInfo.sortOrder || '');
    }
}