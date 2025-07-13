import { Injectable } from "@angular/core";
import { DATE_RANGE_OPTIONS } from "../constants/filter";

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  constructor() { }

  getDateRange(dateRange: string): number {
    switch(dateRange) {
      case 'Last hour':
        return 60 * 60;
      case 'Today':
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return Math.floor((now.getTime() - startOfDay.getTime()) / 1000);
      case 'This week':
        const nowWeek = new Date();
        const dayOfWeek = nowWeek.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
        const startOfWeek = new Date(nowWeek.getFullYear(), nowWeek.getMonth(), nowWeek.getDate() - daysToSubtract);
        return Math.floor((nowWeek.getTime() - startOfWeek.getTime()) / 1000);
      default:
        return 0;
    }
  }

}
