import { Injectable } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { SortOption } from "../core/models/sort.model";
import { environment } from "../../environments/environment";

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
}

@Injectable({
    providedIn: 'root'
})
export class FilterStore extends signalStore(
    withState<FilterState>({
        selectedStores: [],
        selectedCategories: [],
        selectedPriceRange: [...environment.maxPriceRange],
        selectedDiscountRange: [...environment.maxDiscountRange],
        currentPage: 1,
        search: '',
        aiSearch: false,
        sortBy: '',
        sortOrder: '',
        dateRange: 0
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
            }
        }
    })
) { }