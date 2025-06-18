export interface SortOption {
    label: string;
    value: string;
}

export interface SortOptions {
    wordMatch: SortOption[];
    aiMatch: SortOption[];
}

export interface SortCriteria {
    sortBy: string;
    sortOrder: string;
}