import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { ItemDetails } from '../../core/models/item.model';

@Component({
  selector: 'app-item-details-page',
  standalone: false,
  templateUrl: './item-details-page.component.html',
  styleUrl: './item-details-page.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ItemDetailsPageComponent implements OnInit, OnDestroy {
  itemId: string | null = null;
  itemDetails: ItemDetails | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
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
    const emptyStars = 5 - Math.ceil(rating);
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
}

