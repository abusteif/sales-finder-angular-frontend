import { inject, Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { SortCriteria } from "../core/models/sort.model";
import { environment } from "../../environments/environment";
import { UpdateType } from "../core/models/item.model";
import { DEFAULT_FILTER_VALUES } from "../core/constants/filter";
import { DEFAULT_SORT_VALUE } from "../core/constants/sort";
import { SortService } from "../core/services/sort.service";
import { Filter } from "../core/models/filter.model";
import { StorageService } from "../core/services/storage.service";

interface FilterState extends Filter, SortCriteria {
    currentPage: number;
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
        const storageService = inject(StorageService);
        return {
            setSelectedStores: (selectedStores: string[]) => {
                patchState(filter, { selectedStores });
                storageService.setFilterPreferences({ selectedStores } as Filter);
            },
            setSelectedCategories: (selectedCategories: string[]) => {
                patchState(filter, { selectedCategories });
                storageService.setFilterPreferences({ selectedCategories } as Filter);
            },
            setSelectedPriceRange: (selectedPriceRange: number[]) => {
                patchState(filter, { selectedPriceRange });
                storageService.setFilterPreferences({ selectedPriceRange } as Filter);
            },
            setSelectedDiscountRange: (selectedDiscountRange: number[]) => {
                patchState(filter, { selectedDiscountRange });
                storageService.setFilterPreferences({ selectedDiscountRange } as Filter);
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
                storageService.setSortPreferences({ sortBy } as SortCriteria);
            },
            setSortOrder: (sortOrder: string) => {
                patchState(filter, { sortOrder });
                storageService.setSortPreferences({ sortOrder } as SortCriteria);
            },
            setDateRange: (dateRange: string) => {
                patchState(filter, { dateRange });
                storageService.setFilterPreferences({ dateRange } as Filter);
            },
            setUpdateType: (updateType: UpdateType) => {
                patchState(filter, { updateType });
            },
            loadFilterPreferences: () => {
                const filterPreferences = storageService.getUserPreferences()?.filter;
                if (filterPreferences) {
                    patchState(filter, filterPreferences);
                }
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