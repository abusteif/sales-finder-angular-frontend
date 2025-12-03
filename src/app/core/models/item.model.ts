export interface Item {
    id: string;
    name: string;
    store: string;
    category: string;
    oldPrice: number;
    newPrice: number;
    discount: number;
    rating: number;
    ratingCount: number;
    url: string;
    imageUrl: string;
    updatedAt: Date;
    checkedAt: string;
    checksSinceRemoved: number;
    updateType: UpdateType;
    discountChange: string;
    colour: ItemColour;
    highestDiscountSince: number;
    isHighestDiscountEver: boolean;
    trackedSince: number
    isFlactuating: boolean;
    isReportedForSaleExpiry: boolean;
    alertId: string | null;
    isFeatured: boolean;
    isRRPFluctuating: boolean;
}

export interface ItemAlert {
    alertId: string;
    item: Item;
}

export interface ItemColour {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface ItemsAPIResponse {
    items: Item[];
    count: number;
}
export enum UpdateType {
    NEW = 'NEW',
    DISCOUNT_UP = 'DISCOUNT_UP',
    DISCOUNT_DOWN = 'DISCOUNT_DOWN',
    RETURNED = 'RETURNED',
    HIGHEST_DISCOUNT = 'HIGHEST_DISCOUNT',
    DELETED = 'DELETED',
    ALL = 'ALL',
}

export interface ItemDetails {
    "name": string,
    "oldPrice": number,
    "newPrice": number,
    "url": string,
    "store": string,
    "category": string,
    "imageUrl": string,
    "discount": number,
    "priceHistory": PriceHistory[],
    "rating": number,
    "ratingCount": number,
    "isReportedForSaleExpiry": boolean,
    "updateType": UpdateType,
    "updatedAt": Date,
    "averagePrice": number,
    "isFeatured": boolean,
    "isRRPFluctuating": boolean,
}

export interface PriceHistory {
    fullPrice: number;
    discountedPrice: number;
    discount: number;
    date: Date;
}