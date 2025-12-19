import { Injectable } from '@angular/core';
import { Item, ItemDetails, UpdateType } from '../models/item.model';

export interface DiscountIconInfo {
  shouldShow: boolean;
  text: string;
  tooltip: string | null;
  cssClass: string;
}

export interface IndicatorInfo {
  cssClass: string;
  icon: string;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemDisplayService {
  constructor() {}

  /**
   * Get indicator information (NEW, DISCOUNT_UP, etc.)
   */
  getIndicatorInfo(updateType: UpdateType | undefined): IndicatorInfo {
    if (!updateType || updateType === UpdateType.ALL) {
      return {
        cssClass: '',
        icon: '',
        text: ''
      };
    }

    const baseClass = 'indicator-base';
    const shapeClass = updateType === UpdateType.NEW ? 'indicator-pill' : 'indicator-circular';
    const colorClass = this.getIndicatorColorClass(updateType);

    return {
      cssClass: `${baseClass} ${shapeClass} ${colorClass}`,
      icon: this.getIndicatorIcon(updateType),
      text: updateType === UpdateType.NEW ? 'NEW' : ''
    };
  }

  private getIndicatorColorClass(updateType: UpdateType): string {
    switch (updateType) {
      case UpdateType.NEW:
        return 'new-indicator';
      case UpdateType.DISCOUNT_UP:
        return 'discount-up-indicator';
      case UpdateType.DISCOUNT_DOWN:
        return 'discount-down-indicator';
      case UpdateType.RETURNED:
        return 'returned-indicator';
      default:
        return '';
    }
  }

  private getIndicatorIcon(updateType: UpdateType): string {
    switch (updateType) {
      case UpdateType.NEW:
        return 'fas fa-star';
      case UpdateType.DISCOUNT_UP:
        return 'fas fa-arrow-up';
      case UpdateType.DISCOUNT_DOWN:
        return 'fas fa-arrow-down';
      case UpdateType.RETURNED:
        return 'fas fa-redo';
      default:
        return '';
    }
  }

  /**
   * Get discount icon information
   * Works with both Item and ItemDetails (both have the same properties)
   */
  getDiscountIconInfo(
    item: Item | ItemDetails | null,
  ): DiscountIconInfo {
    if (!item) {
      return {
        shouldShow: false,
        text: '',
        tooltip: null,
        cssClass: 'discount-icon'
      };
    }
    
    return this.getDiscountIconInfoFromItem(item as Item);
  }

  private getDiscountIconInfoFromItem(item: Item): DiscountIconInfo {
    const trackedSince = item.trackedSince || 0;
    const highestDiscountSince = item.highestDiscountSince || 0;
    const isHighestDiscountEver = item.isHighestDiscountEver || false;
    const isFeatured = item.isFeatured || false;

    // Don't show discount icon if item has been tracked for a day or less
    if (trackedSince <= 1 && !isFeatured) {
      return {
        shouldShow: false,
        text: '',
        tooltip: null,
        cssClass: 'discount-icon'
      };
    }

    const shouldShow = isFeatured || isHighestDiscountEver || highestDiscountSince > 0;

    if (!shouldShow) {
      return {
        shouldShow: false,
        text: '',
        tooltip: null,
        cssClass: 'discount-icon'
      };
    }

    let text: string;
    let tooltip: string | null;
    let typeClass: string;

    if (isFeatured) {
      text = '🔥';
      if (item.updateType !== UpdateType.NEW && item.updateType !== UpdateType.RETURNED) {
        tooltip = `Lowest price since we started tracking this item! (${trackedSince} days)`;
      } else {
        tooltip = null;
      }
      typeClass = 'discount-icon-highest';
    } else if (isHighestDiscountEver) {
      text = trackedSince.toString();
      tooltip = `Lowest price since we started tracking this item! (${trackedSince} days)`;
      typeClass = 'discount-icon-highest-ever';
    } else {
      text = highestDiscountSince.toString();
      tooltip = `Lowest price in ${highestDiscountSince} days`;
      typeClass = 'discount-icon-days';
    }

    return {
      shouldShow: true,
      text,
      tooltip,
      cssClass: `discount-icon ${typeClass}`
    };
  }

  /**
   * Get RRP fluctuating badge tooltip
   */
  getRRPFluctuatingBadgeTooltip(): string {
    return 'RRP Inflation Alert: This item\'s RRP has fluctuated up and down, indicating the discount may be artificially inflated.';
  }

  /**
   * Get tracking start date from priceHistory or trackedSince property
   */
  getTrackingStartDate(item: Item | ItemDetails | null): Date | null {
    if (!item) {
      return null;
    }

    // If item has priceHistory (ItemDetails), use the oldest date from price history
    if ('priceHistory' in item && item.priceHistory && item.priceHistory.length > 0) {
      // Sort by date to get the oldest entry
      const sortedHistory = [...item.priceHistory].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB; // Ascending order (oldest first)
      });
      return new Date(sortedHistory[0].date);
    }

    // Fallback: calculate from trackedSince (number of days)
    if (item.trackedSince) {
      const now = new Date();
      const trackingStartDate = new Date(now);
      trackingStartDate.setDate(now.getDate() - item.trackedSince);
      return trackingStartDate;
    }

    return null;
  }

  /**
   * Get item tooltip text (for indicator)
   */
  getItemTooltip(item: Item | ItemDetails | null, discountChange?: string, updatedAt?: Date): string {
    if (!item) {
      return '';
    }

    if (item.discountChange) {
      const dateToUse = updatedAt || item.updatedAt;
      const dateStr = dateToUse ? this.formatRelativeDate(dateToUse) : '';
      return dateStr ? `${item.discountChange}\n${dateStr}` : item.discountChange;
    }
    return '';
  }

  /**
   * Format a date as relative time (e.g., "2 days ago")
   */
  private formatRelativeDate(value: Date): string {
    if (!value) {
      return 'Just now';
    }
    
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
      return years + ' years ago';
    } else if (months > 0) {
      return months + ' months ago';
    } else if (days > 0) {
      return days + ' days ago';
    } else if (hours > 0) {
      return hours + ' hours ago';
    } else if (minutes > 0) {
      return minutes + ' minutes ago';
    } else if (seconds > 0) {
      return seconds + ' seconds ago';
    }
    
    return 'Just now';
  }

}

