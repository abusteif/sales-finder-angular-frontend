export interface Alert {
  id?: string;
  item: string;
  url?: string;
  imageUrl?: string;
  minPrice: number;
  maxPrice?: number;
  minDiscount: number;
  isActive: boolean;
  alertType: string;
  stores: string[];
  category?: string;
  exactMatch: boolean;
  aiSearch: boolean;
  lastItemFoundAt?: Date;
  lastItemFound?: string;
  lastItemFoundUrl?: string;
  lastItemFoundImageUrl?: string;
}
