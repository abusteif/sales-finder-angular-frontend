import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { ItemDetails, UpdateType } from '../../core/models/item.model';
import { AppStore } from '../../state/app.store';
import { MatTooltip } from '@angular/material/tooltip';
import { SeoService } from '../../core/services/seo.service';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';

@Component({
  selector: 'app-item-details-page',
  standalone: false,
  templateUrl: './item-details-page.component.html',
  styleUrl: './item-details-page.component.css',
  encapsulation: ViewEncapsulation.None,
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
    private appStore: AppStore,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.appStore.isMobile();
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
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

    this.itemService
      .getItemDetails(itemId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.itemDetails = details;
          this.googleUrl = this.generateGoogleUrl();
          this.isLoading = false;
          this.updateItemSeo(details);
        },
        error: (err) => {
          console.error('Error loading item details:', err);
          this.error = 'Failed to load item details. Please try again later.';
          this.isLoading = false;
        },
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
    if (
      this.itemDetails?.priceHistory &&
      this.itemDetails.priceHistory.length > 0
    ) {
      return new Date(this.itemDetails.priceHistory[0].date);
    }
    return null;
  }

  getAllTimeHighestPrice(): number | null {
    if (
      !this.itemDetails?.priceHistory ||
      this.itemDetails.priceHistory.length === 0
    ) {
      return null;
    }
    const prices = this.itemDetails.priceHistory
      .map((history) => history.discountedPrice)
      .filter((price) => price !== null && price !== undefined && price > 0);
    return prices.length > 0 ? Math.max(...prices) : null;
  }

  getAllTimeLowestPrice(): number | null {
    if (
      !this.itemDetails?.priceHistory ||
      this.itemDetails.priceHistory.length === 0
    ) {
      return null;
    }
    const prices = this.itemDetails.priceHistory
      .map((history) => history.discountedPrice)
      .filter((price) => price !== null && price !== undefined && price > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  isLowestPriceEver(): boolean {
    if (!this.itemDetails) {
      return false;
    }
    if (this.hasOnlyOnePriceHistory()) {
      return false;
    }
    const lowestPrice = this.getAllTimeLowestPrice();
    if (lowestPrice === null) {
      return false;
    }
    const count = this.itemDetails.priceHistory.filter(
      (history) => history.discountedPrice === lowestPrice
    ).length;
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
      ? `https://www.google.com/search?q=${encodeURIComponent(
          this.itemDetails.name
        )}`
      : '';
  }

  private updateItemSeo(details: ItemDetails): void {
    const itemUrl = `${GENERIC_SETTINGS.domain}/item/${this.itemId}`;
    const description = this.buildItemDescription(details);
    const availability =
      details.updateType === UpdateType.DELETED
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock';

    this.seoService.update({
      title: `${details.name} | ${GENERIC_SETTINGS.app_name}`,
      description,
      robots:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      image: details.imageUrl || GENERIC_SETTINGS.socialImage,
      url: itemUrl,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: details.name,
        image: details.imageUrl ? [details.imageUrl] : undefined,
        brand: details.store,
        category: details.category,
        url: itemUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'AUD',
          price: details.newPrice ?? details.oldPrice,
          availability,
        },
        aggregateRating: details.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: details.rating,
              reviewCount: details.ratingCount ?? undefined,
            }
          : undefined,
      },
    });
  }

  private buildItemDescription(details: ItemDetails): string {
    const hasNewPrice =
      details.newPrice !== null && details.newPrice !== undefined;
    const price = hasNewPrice
      ? `Now $${details.newPrice.toFixed(2)}`
      : 'Live price tracking available';
    const hasDiscount =
      details.discount !== null &&
      details.discount !== undefined &&
      details.discount > 0;
    const discount = hasDiscount ? `(${details.discount}% off)` : '';
    return `${details.name} at ${details.store}. ${price} ${discount}. Track price history and alerts with ${GENERIC_SETTINGS.app_name}.`.trim();
  }

  getLastPriceChange(): {
    date: Date | null;
    changeType:
      | 'increase'
      | 'decrease'
      | 'no-change'
      | 'back-on-sale'
      | 'not-on-sale'
      | null;
    amount: number | null;
  } {
    const hasPriceHistory =
      this.itemDetails?.priceHistory &&
      this.itemDetails.priceHistory.length > 0;
    if (!hasPriceHistory) {
      return { date: null, changeType: null, amount: null };
    }

    // Sort price history by date (most recent first)
    const sortedHistory = [...this.itemDetails!.priceHistory!].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order
    });

    const latest = sortedHistory[0];

    // Show explicit message when the item has been removed from sale/out of stock
    if (
      this.itemDetails?.updateType === UpdateType.DELETED &&
      (latest.discount ?? 0) === 0
    ) {
      return {
        date: new Date(latest.date),
        changeType: 'not-on-sale',
        amount: null,
      };
    }

    // If item has RETURNED status, show it as back on sale
    if (this.itemDetails?.updateType === UpdateType.RETURNED) {
      return {
        date: new Date(latest.date),
        changeType: 'back-on-sale',
        amount: null,
      };
    }

    if (sortedHistory.length < 2) {
      return { date: null, changeType: null, amount: null };
    }

    // For DISCOUNT_UP or DISCOUNT_DOWN, find the previous element that doesn't have a discount of 0
    let previous;
    if (
      this.itemDetails?.updateType === UpdateType.DISCOUNT_UP ||
      this.itemDetails?.updateType === UpdateType.DISCOUNT_DOWN
    ) {
      // Find the previous entry with discount !== 0
      previous = sortedHistory.find(
        (entry, index) => index > 0 && (entry.discount ?? 0) !== 0
      );

      // If no previous entry with non-zero discount found, fall back to immediately previous entry
      if (!previous) {
        previous = sortedHistory[1];
      }
    } else {
      // For other update types, use the immediately previous entry
      previous = sortedHistory[1];
    }

    const latestPrice = latest.discountedPrice;
    const previousPrice = previous.discountedPrice;

    if (
      latestPrice === null ||
      latestPrice === undefined ||
      previousPrice === null ||
      previousPrice === undefined
    ) {
      return { date: null, changeType: null, amount: null };
    }

    const amount = latestPrice - previousPrice;
    const changeType =
      amount > 0 ? 'increase' : amount < 0 ? 'decrease' : 'no-change';

    return {
      date: new Date(latest.date),
      changeType: changeType,
      amount: Math.abs(amount),
    };
  }
}
