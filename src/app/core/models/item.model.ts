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
}

export interface ItemsAPIResponse {
    items: Item[];
    count: number;
}
export enum UpdateType {
    NEW = 'NEW',
    DISCOUNT_UP = 'DISCOUNT_UP',
    DISCOUNT_DOWN = 'DISCOUNT_DOWN',
    ALL = 'ALL',
}