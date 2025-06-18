import { Injectable } from "@angular/core";

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
        return 24 * 60 * 60;
      case 'This week':
        return 7 * 24 * 60 * 60;
      default:
        return 0;
    }
  }
}
