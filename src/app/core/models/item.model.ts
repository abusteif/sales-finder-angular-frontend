export interface Item {
    id: string;
    name: string;
    store: string;
    category: string;
    oldPrice: number;
    newPrice: number;
    discount: number;
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
    ALL = 'ALL',
}