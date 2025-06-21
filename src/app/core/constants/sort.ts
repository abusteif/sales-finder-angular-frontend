export const SORT_OPTIONS = [
    { label: 'Newest First', value: 'date_desc' },
    { label: 'Oldest First', value: 'date_asc' },
    { label: 'Price (Low to High)', value: 'price_asc' },
    { label: 'Price (High to Low)', value: 'price_desc' },
    { label: 'Discount (High to Low)', value: 'discount_desc' },
    { label: 'Discount (Low to High)', value: 'discount_asc' },
    { label: 'Name (A to Z)', value: 'name_asc' },
    { label: 'Name (Z to A)', value: 'name_desc' },
    ];
    
    export const DEFAULT_SORT_VALUE = SORT_OPTIONS.find(option => option.value === 'name_asc');
    