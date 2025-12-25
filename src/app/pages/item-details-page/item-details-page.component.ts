import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  takeUntil,
  switchMap,
  of,
  tap,
  catchError,
  filter,
} from 'rxjs';
import { ItemService } from '../../core/services/item.service';
import { Item, ItemDetails, UpdateType } from '../../core/models/item.model';
import { AppStore } from '../../state/app.store';
import { MatTooltip } from '@angular/material/tooltip';
import { SeoService } from '../../core/services/seo.service';
import { GENERIC_SETTINGS } from '../../core/constants/generic-settings';
import { RelativeDatePipe } from '../../shared/relative-date.pipe';
import { ItemDisplayService } from '../../core/services/item-display.service';
import { Alert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthenticationStore } from '../../state/authentication.store';
import { UserService } from '../../core/services/user.service';
import { UserReportsService } from '../../core/services/userReports.service';
import { StatusDialogService } from '../../core/services/status-dialog.service';
@Component({
  selector: 'app-item-details-page',
  standalone: false,
  templateUrl: './item-details-page.component.html',
  styleUrls: ['./item-details-page.component.css', '../../shared/icons.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [RelativeDatePipe],
})
export class ItemDetailsPageComponent implements OnInit, OnDestroy {
  @ViewChild(MatTooltip) titleTooltip!: MatTooltip;

  itemId: string | null = null;
  itemDetails: ItemDetails | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isMobile: boolean = false;
  googleUrl: string = '';
  UpdateType = UpdateType;
  showAlertModal: boolean = false;
  alertDetails: Alert | null = null;
  initialAlertDetails: Alert | null = null;
  itemDetailsForAlert: Item | null = null;
  initialItemDetailsForAlert: any = null;
  isReportedForSaleExpiry: boolean = false;
  GENERIC_SETTINGS = GENERIC_SETTINGS;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private appStore: AppStore,
    private seoService: SeoService,
    private itemDisplayService: ItemDisplayService,
    private alertService: AlertService,
    private userService: UserService,
    private authenticationStore: AuthenticationStore,
    private router: Router,
    private userReportsService: UserReportsService,
    private statusDialogService: StatusDialogService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.appStore.isMobile();
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.itemId = params.get('itemId');
          if (this.itemId) {
            return this.loadItemDetails(this.itemId);
          }
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadItemDetails(itemId: string) {
    this.isLoading = true;
    this.error = null;

    return this.itemService.getItemDetails(itemId).pipe(
      tap((details) => {
        this.itemDetails = details;
        this.googleUrl = this.generateGoogleUrl();
        this.isLoading = false;
        this.updateItemSeo(details);
        this.itemDetailsForAlert = details;
        this.initialItemDetailsForAlert = details;
        this.isReportedForSaleExpiry = details.isReportedForSaleExpiry;
      }),
      switchMap((details) => {
        if (details?.alertId) {
          return this.loadAlertDetails(details.alertId);
        }
        return of(null);
      }),
      catchError((err) => {
        console.error('Error loading item details:', err);
        this.error = 'Failed to load item details. Please try again later.';
        this.isLoading = false;
        this.seoService.update({
          title: `${GENERIC_SETTINGS.app_name} | Item Not Found`,
          description: `The requested item could not be found on ${GENERIC_SETTINGS.app_name}.`,
          robots: 'noindex, nofollow',
          url: `${GENERIC_SETTINGS.domain}/item/${this.itemId ?? ''}`,
        });
        return of(null);
      })
    );
  }

  private loadAlertDetails(alertId: string) {
    return this.alertService.getAlert(alertId).pipe(
      tap((alert: Alert) => {
        this.alertDetails = alert;
        this.initialAlertDetails = { ...alert };
        this.initialItemDetailsForAlert = { ...this.itemDetailsForAlert };
      }),
      catchError((err) => {
        console.error('Error loading alert details:', err);
        return of(null);
      })
    );
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
    return this.itemDisplayService.getTrackingStartDate(this.itemDetails);
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

  getIndicatorClass(): string {
    const indicatorInfo = this.itemDisplayService.getIndicatorInfo(
      this.itemDetails?.updateType
    );
    return indicatorInfo.cssClass;
  }

  getIndicatorIcon(): string {
    const indicatorInfo = this.itemDisplayService.getIndicatorInfo(
      this.itemDetails?.updateType
    );
    return indicatorInfo.icon;
  }

  getIndicatorText(): string {
    const indicatorInfo = this.itemDisplayService.getIndicatorInfo(
      this.itemDetails?.updateType
    );
    return indicatorInfo.text;
  }

  itemTooltip(): string {
    return this.itemDisplayService.getItemTooltip(
      this.itemDetails,
      undefined,
      this.itemDetails?.updatedAt
    );
  }

  shouldShowDiscountIcon(): boolean {
    const discountInfo = this.itemDisplayService.getDiscountIconInfo(
      this.itemDetails
    );
    return discountInfo.shouldShow;
  }

  getDiscountIconText(): string {
    const discountInfo = this.itemDisplayService.getDiscountIconInfo(
      this.itemDetails
    );
    return discountInfo.text;
  }

  getDiscountIconTooltip(): string | null {
    const discountInfo = this.itemDisplayService.getDiscountIconInfo(
      this.itemDetails
    );
    return discountInfo.tooltip;
  }

  getDiscountIconClass(): string {
    const discountInfo = this.itemDisplayService.getDiscountIconInfo(
      this.itemDetails
    );
    return discountInfo.cssClass;
  }

  getRRPFluctuatingBadgeTooltip(): string {
    return this.itemDisplayService.getRRPFluctuatingBadgeTooltip(
      this.itemDetails
    );
  }

  shouldDisplayShareBanner(): boolean {
    return this.itemDetails?.updateType !== UpdateType.DELETED && !this.isLoading;
  }

  private updateItemSeo(details: ItemDetails): void {
    const itemUrl = `${GENERIC_SETTINGS.domain}/item/${this.itemId}`;
    const description = this.buildItemDescription(details);
    const robots =
      details.updateType === UpdateType.DELETED
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const availability =
      details.updateType === UpdateType.DELETED
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock';

    this.seoService.update({
      title: `${details.name} | ${GENERIC_SETTINGS.app_name}`,
      description,
      robots,
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

  onAlertButtonClick(): void {
    this.userService
      .getUserDetails()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.authenticationStore.clearAuth();
          this.router.navigate(['/login']);
          return of(null);
        })
      )
      .subscribe(() => {
        this.showAlertModal = true;
      });
    this.alertDetails = this.initialAlertDetails;
    this.itemDetailsForAlert = this.initialItemDetailsForAlert;
  }

  closeAlertModal(): void {
    this.showAlertModal = false;
    this.alertDetails = null;
    this.itemDetailsForAlert = null;
  }

  submitAlert(alert: Alert | null): void {
    if (this.itemId && alert) {
      this.loadItemDetails(this.itemId)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  onReportButtonClick(): void {
    if (this.isReportedForSaleExpiry) {
      this.statusDialogService
        .showInfo(
          'Already Reported',
          'This item has already been reported as no longer on sale. The system will process this report and update the item accordingly.',
          'OK'
        )
        .subscribe();
      return;
    }

    this.statusDialogService
      .showConfirmation(
        'Report Discount Issue',
        'Are you sure you want to report a discount issue with this item? Your report will be reviewed and the item will be updated if needed.',
        'Yes',
        'No'
      )
      .pipe(
        filter((result) => result === true),
        switchMap(() =>
          this.userReportsService.reportSaleExpiry(this.itemId ?? '')
        ),
        switchMap(() =>
          this.statusDialogService.showSuccess(
            'Report Submitted',
            'Thank you for your report. We will review this discount issue and update the item if needed.',
            'OK'
          )
        ),
        switchMap(() => this.loadItemDetails(this.itemId ?? '')),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onDiscountIconClick(event: MouseEvent, discountTooltip: any): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isMobile && discountTooltip) {
      discountTooltip.show();

      setTimeout(() => {
        discountTooltip.hide();
      }, 2000);
    }
  }
}
