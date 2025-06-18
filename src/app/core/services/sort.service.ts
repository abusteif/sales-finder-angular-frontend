import { Injectable } from "@angular/core";
import { SortCriteria, SortOption } from "../models/sort.model";

@Injectable({
    providedIn: 'root'
})
export class SortService {
    constructor() { }

    getSortOptions(isAiSearch: boolean): SortOption[] {
        const sortOptionsWordMatch = [
            { label: 'Newest First', value: 'date_desc' },
            { label: 'Oldest First', value: 'date_asc' },
            { label: 'Name (A to Z)', value: 'name_asc' },
            { label: 'Name (Z to A)', value: 'name_desc' },
            { label: 'Price (Low to High)', value: 'price_asc' },
            { label: 'Price (High to Low)', value: 'price_desc' },
            { label: 'Discount (High to Low)', value: 'discount_desc' },
            { label: 'Discount (Low to High)', value: 'discount_asc' },
          ] 
          const sortOptionsAiMatch = [
            ...sortOptionsWordMatch,
            { label: 'Similarity', value: 'similarity_desc' },
          ]
          return isAiSearch ? sortOptionsAiMatch : sortOptionsWordMatch;
    }
    processSortOption(sortOption: string): SortCriteria {
        const sortBy = sortOption.split('_')[0];
        const sortOrder = sortOption.split('_')[1];
        return {
            sortBy,
            sortOrder
        }
    }
}
