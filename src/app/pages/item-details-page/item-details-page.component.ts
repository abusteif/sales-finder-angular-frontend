import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { ItemDetails, UpdateType } from '../../core/models/item.model';
import { AppStore } from '../../state/app.store';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-item-details-page',
  standalone: false,
  templateUrl: './item-details-page.component.html',
  styleUrl: './item-details-page.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ItemDetailsPageComponent implements OnInit, OnDestroy {
  @ViewChild(MatTooltip) titleTooltip!: MatTooltip;
  
  itemId: string | null = null;
  itemDetails: ItemDetails | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isMobile: boolean = false;
  googleUrl: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private titleService: Title,
    private appStore: AppStore
  ) {}

  ngOnInit(): void {
    this.isMobile = this.appStore.isMobile();
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.itemId = params.get('itemId');
        if (this.itemId) {
          this.loadItemDetails(this.itemId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadItemDetails(itemId: string): void {
    this.isLoading = true;
    this.error = null;

    this.itemService.getItemDetails(itemId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.itemDetails = details;
          this.googleUrl = this.generateGoogleUrl();
          this.isLoading = false;
          // Set page title to item name
          if (details.name) {
            this.titleService.setTitle(details.name);
          }
        },
        error: (err) => {
          console.error('Error loading item details:', err);
          this.error = 'Failed to load item details. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }

    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt');
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('far fa-star');
    }

    return stars;
  }

  hasOnlyOnePriceHistory(): boolean {
    return this.itemDetails?.priceHistory?.length === 1;
  }

  getTrackingStartDate(): Date | null {
    if (this.itemDetails?.priceHistory && this.itemDetails.priceHistory.length > 0) {
      return new Date(this.itemDetails.priceHistory[0].date);
    }
    return null;
  }

  getAllTimeHighestPrice(): number | null {
    if (!this.itemDetails?.priceHistory || this.itemDetails.priceHistory.length === 0) {
      return null;
    }
    const prices = this.itemDetails.priceHistory
      .map(history => history.discountedPrice)
      .filter(price => price !== null && price !== undefined && price > 0);
    return prices.length > 0 ? Math.max(...prices) : null;
  }

  getAllTimeLowestPrice(): number | null {
    if (!this.itemDetails?.priceHistory || this.itemDetails.priceHistory.length === 0) {
      return null;
    }
    const prices = this.itemDetails.priceHistory
      .map((history) => history.discountedPrice)
      .filter(price => price !== null && price !== undefined && price > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  isLowestPriceEver(): boolean {
    if (!this.itemDetails) {
      return false;
    }
    // Don't show lowest price badge/frame if there's only 1 history entry
    if (this.hasOnlyOnePriceHistory()) {
      return false;
    }
    const lowestPrice = this.getAllTimeLowestPrice();
    if (lowestPrice === null) {
      return false;
    }
    // Compare current price with all-time lowest (with small tolerance for floating point comparison)
    const count = this.itemDetails.priceHistory.filter(history => history.discountedPrice === lowestPrice).length;
    if (count > 1) {
      return false;
    }
    if (this.itemDetails.newPrice === lowestPrice) {
      return true;
    }
    return false;
  }

  onTitleClick(event: MouseEvent, titleTooltip: any): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isMobile && titleTooltip) {
      titleTooltip.show();

      setTimeout(() => {
        titleTooltip.hide();
      }, 2000);
    }
  }

  generateGoogleUrl(): string {
    return this.itemDetails?.name 
      ? `https://www.google.com/search?q=${encodeURIComponent(this.itemDetails.name)}`
      : '';
  }

  getLastPriceChange(): { date: Date | null; changeType: 'increase' | 'decrease' | 'no-change' | 'back-on-sale' | null; amount: number | null } {
    // If item has RETURNED status, show it as back on sale
    if (this.itemDetails?.updateType === UpdateType.RETURNED) {
      if (!this.itemDetails?.priceHistory || this.itemDetails.priceHistory.length === 0) {
        return { date: null, changeType: null, amount: null };
      }
      // Sort price history by date (most recent first)
      const sortedHistory = [...this.itemDetails.priceHistory].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Descending order
      });
      const latest = sortedHistory[0];
      return {
        date: new Date(latest.date),
        changeType: 'back-on-sale',
        amount: null
      };
    }

    if (!this.itemDetails?.priceHistory || this.itemDetails.priceHistory.length < 2) {
      return { date: null, changeType: null, amount: null };
    }

    // Sort price history by date (most recent first)
    const sortedHistory = [...this.itemDetails.priceHistory].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order
    });

    const latest = sortedHistory[0];
    const previous = sortedHistory[1];

    const latestPrice = latest.discountedPrice;
    const previousPrice = previous.discountedPrice;

    if (latestPrice === null || latestPrice === undefined || previousPrice === null || previousPrice === undefined) {
      return { date: null, changeType: null, amount: null };
    }

    const amount = latestPrice - previousPrice;
    const changeType = amount > 0 ? 'increase' : amount < 0 ? 'decrease' : 'no-change';

    return {
      date: new Date(latest.date),
      changeType: changeType,
      amount: Math.abs(amount)
    };
  }
}

