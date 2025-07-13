export interface Alert {
  id: string;
  item: string;
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  isActive: boolean;
  alertType: string;
  store: string
  category: string
}
