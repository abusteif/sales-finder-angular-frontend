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
    updateType: string;
}