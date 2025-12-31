import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { ItemDetails } from '../../core/models/item.model';
import { AppStore } from '../../state/app.store';
import { SeoService } from '../../core/services/seo.service';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';

@Component({
  selector: 'app-compare-page',
  standalone: false,
  templateUrl: './compare-page.component.html',
  styleUrls: ['./compare-page.component.css', '../../shared/icons.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ComparePageComponent implements OnInit, OnDestroy {
  items: { [key: string]: ItemDetails } = {};
  itemIds: string[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  isMobile: boolean = false;
  GENERIC_SETTINGS = GENERIC_SETTINGS;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private appStore: AppStore,
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isMobile = this.appStore.isMobile();
    
    // Get itemIds from query parameters
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const itemIdsParam = params['items'];
        
        if (itemIdsParam) {
          // Handle both comma-separated and array formats
          if (Array.isArray(itemIdsParam)) {
            this.itemIds = itemIdsParam;
          } else {
            this.itemIds = itemIdsParam.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0);
          }
          
          if (this.itemIds.length > 0) {
            this.loadCompareData();
          } else {
            this.error = 'No item IDs provided. Please provide item IDs in the URL query parameters.';
            this.isLoading = false;
          }
        } else {
          this.error = 'No item IDs provided. Please provide item IDs in the URL query parameters.';
          this.isLoading = false;
        }
      });

    // Update SEO
    this.seoService.update({
      title: `Compare Items | ${GENERIC_SETTINGS.app_name}`,
      description: `Compare prices, discounts, and ratings across multiple items on ${GENERIC_SETTINGS.app_name}.`,
      robots: 'noindex, nofollow',
      url: `${GENERIC_SETTINGS.domain}/compare`,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCompareData(): void {
    this.isLoading = true;
    this.error = null;

    this.itemService
      .compareItems(this.itemIds)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Error loading compare data:', err);
          this.error = 'Failed to load comparison data. Please try again later.';
          this.isLoading = false;
          return of({});
        })
      )
      .subscribe((response) => {
        this.items = response;
        this.isLoading = false;
        
        if (Object.keys(this.items).length === 0) {
          this.error = 'No items found for comparison.';
        }
      });
  }

  getItemsArray(): ItemDetails[] {
    return Object.values(this.items);
  }

  getDaysSinceTracking(item: ItemDetails): number {
    // trackedSince is already the number of days since tracking started
    return item.trackedSince || 0;
  }

  getStars(rating: number | null | undefined): string[] {
    const stars: string[] = [];
    
    // Convert to number if it's a string, and handle null/undefined
    const numRating = typeof rating === 'number' ? rating : (rating ? Number(rating) : 0);
    
    // If no rating, return all empty stars
    if (!numRating || numRating === 0 || isNaN(numRating)) {
      for (let i = 0; i < 5; i++) {
        stars.push('far fa-star');
      }
      return stars;
    }

    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

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

  getFormattedRating(rating: number | null | undefined): string | null {
    if (!rating) return null;
    
    // Convert to number if it's a string
    const numRating = typeof rating === 'number' ? rating : Number(rating);
    
    // Check if it's a valid number and greater than 0
    if (isNaN(numRating) || numRating <= 0) {
      return null;
    }
    
    return numRating.toFixed(1);
  }

  getHighestDiscount(): number {
    const items = this.getItemsArray();
    if (items.length === 0) return 0;
    
    return Math.max(...items.map(item => item.discount || 0));
  }

  getLowestPrice(): number {
    const items = this.getItemsArray();
    if (items.length === 0) return Infinity;
    
    const validPrices = items
      .map(item => item.newPrice)
      .filter(price => price != null && price > 0);
    
    return validPrices.length > 0 ? Math.min(...validPrices) : Infinity;
  }

  isHighestDiscount(item: ItemDetails): boolean {
    if (!item.discount || item.discount <= 0) return false;
    return item.discount === this.getHighestDiscount();
  }

  isLowestPrice(item: ItemDetails): boolean {
    if (!item.newPrice || item.newPrice <= 0) return false;
    return item.newPrice === this.getLowestPrice();
  }

  navigateToItem(itemId: string): void {
    this.router.navigate(['/item', itemId]);
  }

  truncateName(name: string | null | undefined, maxLength: number = 100): string {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  }
}

