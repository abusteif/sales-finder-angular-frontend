export interface Store {
    id: string;
    name: string;
    baseUrl: string;
    checkedAt: Date;
    categories?: string[];
}
