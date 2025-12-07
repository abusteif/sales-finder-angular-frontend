import { Component, Input, signal, ViewChild } from '@angular/core';
import {
  Item,
  UpdateType,
  ItemColour,
  ItemAlert,
} from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';
import { AppStore } from '../../../state/app.store';
import { MatTooltip } from '@angular/material/tooltip';
import { RelativeDatePipe } from '../../../shared/relative-date.pipe';
import { Router } from '@angular/router';
import { DEFAULT_CARDS_PER_ROW } from '../../../core/constants/display';
import { StatusDialogService } from '../../../core/services/status-dialog.service';
import { UserReportsService } from '../../../core/services/userReports.service';
import { ItemsStore } from '../../../state/items.store';
import { UserRole } from '../../../core/models/user.models';

export const itemAlertSignal = signal<ItemAlert | null>(null);
@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css', '../../../shared/icons.css'],
  providers: [RelativeDatePipe],
})
export class ItemCardComponent {
  @ViewChild(MatTooltip) tooltip!: MatTooltip;

  @Input() alertLimitReached: boolean = false;
  @Input() set item(item: Item) {
    this._item = item;
    this.camelCamelCamelUrl = this.generateCamelCamelCamelUrl();
    this.updateType = item.updateType;
    this.updatedAt = item.updatedAt;
    this.discountChange = item.discountChange;
    this.rating = item.rating
    this.ratingCount = item.ratingCount
    this.colour = item.colour;
    this.highestDiscountSince = item.highestDiscountSince || 0;
    this.isHighestDiscountEver = item.isHighestDiscountEver || false;
    this.trackedSince = item.trackedSince || 0;
    this.isFlactuating = item.isFlactuating || false;
    this.alertId = item.alertId || null;
    this._itemAlert = {
      alertId: this.alertId || '',
      item: this._item,
    };
    this.googleUrl = this.generateGoogleUrl();
    this.imageLoadError = false; // Reset image error on new item
    this.isFeatured = item.isFeatured || false;
    this.isReportedForSaleExpiry = item.isReportedForSaleExpiry || false;
    this.isPotentiallyDeleted = item.checksSinceRemoved > 8;
    this.isRRPFluctuating = item.isRRPFluctuating || false;
  }
  @Input() set storesCheckedAt(
    storesCheckedAt: { name: string; checkedAt: Date }[]
  ) {
    this.lastCheckedAt = storesCheckedAt.filter(
      (store) => store.name === this._item.store
    )[0]?.checkedAt;
  }
  @Input() isAuthenticated: boolean = false;
  @Input() cardsPerRow: number = DEFAULT_CARDS_PER_ROW;

  get item() {
    return this._item;
  }

  @Input() set userRole(userRole: UserRole) {
    this.isAdmin = userRole === UserRole.ADMIN;
  }

  _item: Item = {} as Item;
  _itemAlert: ItemAlert = {} as ItemAlert;
  lastCheckedAt: Date = new Date();
  updatedAt: Date = new Date();
  updateType: UpdateType = UpdateType.ALL;
  discountChange: string = '';
  UpdateType = UpdateType;
  isMobile: boolean = false;
  colour: ItemColour | null = null;
  highestDiscountSince: number = 0;
  isHighestDiscountEver: boolean = false;
  trackedSince: number = 0;
  isFlactuating: boolean = false;
  alertId: string | null = null;
  imageLoadError: boolean = false;
  rating: number = 0
  ratingCount: number = 0
  isFeatured: boolean = false;
  isReportedForSaleExpiry: boolean = false;
  isAdmin: boolean = false;
  isPotentiallyDeleted: boolean = false;
  isRRPFluctuating: boolean = false;
  // Default shadow styles
  private readonly defaultShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
  private readonly defaultHoverShadow = '0 8px 16px rgba(0, 0, 0, 0.5)';

  constructor(
    private appStore: AppStore,
    private relativeDatePipe: RelativeDatePipe,
    private router: Router,
    private statusDialogService: StatusDialogService,
    private userReportsService: UserReportsService,
    private items: ItemsStore
  ) {
    this.isMobile = this.appStore.isMobile();
  }

  onCardClick(event: MouseEvent) {
    if (this.isAdmin && this._item?.id) {
      navigator.clipboard.writeText(this._item.id);
    }
    // If Ctrl (or Cmd on Mac) is pressed AND user is admin, open item details page
    if (true) {
      this.openItemDetailsPage();
    } else {
      // Regular click: navigate to the store's item page
      if (this._item?.url) {
        window.open(this._item.url, '_blank');
      }
    }
  }

  openItemDetailsPage() {
    if (this._item?.id) {
      const url = this.router.serializeUrl(this.router.createUrlTree(['/item', this._item.id]));
      window.open(url, '_blank');
    }
  }

  getItemDetailsUrl(): string {
    if (this._item?.id) {
      return this.router.serializeUrl(this.router.createUrlTree(['/item', this._item.id]));
    }
    return '#';
  }

  onAlertButtonClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.isAlertDisabled()) {
      itemAlertSignal.set(this._itemAlert);
    }
  }

  getTooltipText(): string {
    if (!this.isAuthenticated) {
      return `Please login to create an alert for this item`;
    }
    if (this.alertLimitReached && !this.alertId) {
      return `You've reached your alert limit. Get in touch and we'll help you set up more!`;
    }
    if (this.alertId) {
      return `Update Alert For This Item`;
    }
    return `Create Alert For This Item`;
  }

  getTitleClass(): string {
    return this.isMobile ? 'title is-8 card-title' : 'title is-6  card-title';
  }

  getCardFontSizeClass(): string {
    if (!this.isMobile) {
      return 'card-font-desktop';
    }

    // On mobile, adjust font size based on cards per row
    switch (this.cardsPerRow) {
      case 1:
        return 'card-font-mobile-single';
      case 2:
        return 'card-font-mobile-double';
      case 3:
      default:
        return 'card-font-mobile-triple';
    }
  }

  getCardShadowStyle(): string {
    if (!this.colour) {
      return this.defaultShadow;
    }

    // Convert colour object to rgba with appropriate opacity for shadow
    const shadowColor = this.colourToRgba(this.colour, 0.5);
    return `0 4px 8px ${shadowColor}`;
  }

  getCardHoverShadowStyle(): string {
    if (!this.colour) {
      return this.defaultHoverShadow;
    }

    // Convert colour object to rgba with appropriate opacity for hover shadow
    const shadowColor = this.colourToRgba(this.colour, 0.6);
    return `0 8px 16px ${shadowColor}`;
  }

  private colourToRgba(colour: ItemColour, alpha: number): string {
    // Convert the alpha from 0-255 range to 0-1 range for the final alpha value
    const normalizedAlpha = Math.min(alpha, 1);
    return `rgba(${colour.red}, ${colour.green}, ${colour.blue}, ${normalizedAlpha})`;
  }

  shouldShowDiscountIcon(): boolean {
    // Don't show discount icon if item has been tracked for a day or less
    if (this.trackedSince <= 1 && !this.isFeatured) {
      return false;
    }
    return (
      this.isFeatured ||
      this.isHighestDiscountEver ||
      this.highestDiscountSince > 0
    );
  }

  getDiscountIconText(): string {
    if (this.isFeatured) {
      return '🔥';
    } else if (this.isHighestDiscountEver) {
      return this.highestDiscountSince.toString();
    } else {
      return this.highestDiscountSince.toString();
    }
  }

  getDiscountIconTooltip(): string | null {
    if (this.isFeatured) {
      if (
        this.updateType !== UpdateType.NEW &&
        this.updateType !== UpdateType.RETURNED
      ) {
        return `Lowest price since we started tracking this item! (${this.trackedSince} days)`;
      } else {
        return null;
      }
    } else if (this.isHighestDiscountEver) {
      return `Lowest price since we started tracking this item! (${this.highestDiscountSince} days)`;
    } else {
      return `Lowest price in ${this.highestDiscountSince} days`;
    }
  }

  getDiscountIconClass(): string {
    const baseClass = 'discount-icon';
    let typeClass: string;
    if (this.isFeatured) {
      typeClass = 'discount-icon-highest';
    } else if (this.isHighestDiscountEver) {
      typeClass = 'discount-icon-highest-ever';
    } else {
      typeClass = 'discount-icon-days';
    }
    return `${baseClass} ${typeClass}`;
  }

  camelCamelCamelUrl: string = '';
  googleUrl: string = '';
  generateGoogleUrl() {
    return `https://www.google.com/search?q=${this._item?.name}`;
  }
  generateCamelCamelCamelUrl() {
    const itemUrl = this._item?.url;
    const splits = itemUrl?.split('/');
    const itemId = splits?.[splits?.length - 2];
    return `${environment.camelCamelCamelBaseUrl}/product/${itemId}`;
  }

  onStoreLogoHover() {
    if (!this.lastCheckedAt) return '';
    const date = new Date(this.lastCheckedAt);
    return `Last checked at ${date.toLocaleDateString()} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  getIndicatorClass(): string {
    const baseClass = 'indicator-base';
    const shapeClass =
      this.updateType === UpdateType.NEW
        ? 'indicator-pill'
        : 'indicator-circular';
    const colorClass = this.getIndicatorColorClass();

    return `${baseClass} ${shapeClass} ${colorClass}`;
  }

  private getIndicatorColorClass(): string {
    switch (this.updateType) {
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

  getIndicatorIcon(): string {
    switch (this.updateType) {
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

  itemTooltip(): string {
    return `${this.discountChange}\n${this.relativeDatePipe.transform(
      this.updatedAt
    )}`;
  }

  getIndicatorText(): string {
    return this.updateType === UpdateType.NEW ? 'NEW' : '';
  }

  onIndicatorClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.tooltip) {
      this.tooltip.show();

      setTimeout(() => {
        this.tooltip.hide();
      }, 1000);
    }
  }

  onDiscountIconClick(event: MouseEvent, discountTooltip: any) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isMobile && discountTooltip) {
      discountTooltip.show();

      setTimeout(() => {
        discountTooltip.hide();
      }, 2000);
    }
  }

  shouldShowVolatilityWarning(): boolean {
    // Show volatility warning when item is fluctuating and has a discount icon
    return this.isFlactuating;
  }

  getVolatilityWarningTooltip(): string {
    return "Price Alert: This item's price changes frequently, which may indicate a misleading discount";
  }

  isAlertDisabled(): boolean {
    return this.alertLimitReached && !this.alertId && this.isAuthenticated;
  }

  onVolatilityIconClick(event: MouseEvent, volatilityTooltip: any) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isMobile && volatilityTooltip) {
      volatilityTooltip.show();

      setTimeout(() => {
        volatilityTooltip.hide();
      }, 3000); // Show longer for warning message
    }
  }

  onAlertIndicatorClick(event: MouseEvent, alertTooltip: any) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isMobile && alertTooltip) {
      alertTooltip.show();

      setTimeout(() => {
        alertTooltip.hide();
      }, 2000);
    }
  }

  onRRPFluctuatingBadgeClick(event: MouseEvent, rrpFluctuatingTooltip: any) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isMobile && rrpFluctuatingTooltip) {
      rrpFluctuatingTooltip.show();

      setTimeout(() => {
        rrpFluctuatingTooltip.hide();
      }, 4000); // Show longer for explanation message
    }
  }

  onImageError() {
    this.imageLoadError = true;
  }

  getStars(): string[] {
    const stars: string[] = [];
    
    // If no rating, show 5 empty stars
    if (!this.rating || this.rating === 0) {
      for (let i = 0; i < 5; i++) {
        stars.push('far fa-star');
      }
      return stars;
    }
    
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt');
    }
    
    // Add empty stars to make total 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('far fa-star');
    }
    
    return stars;
  }

  getStarColor(): string {
    // Return a golden color for stars
    return '#ffc107';
  }

  getFormattedRatingCount(): string {
    if (this.ratingCount >= 1000) {
      const kValue = this.ratingCount / 1000;
      return kValue % 1 === 0 ? `${Math.floor(kValue)}k` : `${kValue.toFixed(1)}k`;
    }
    return this.ratingCount.toString();
  }

  getReportButtonTooltip(): string {
    if (this.isReportedForSaleExpiry) {
      return 'This item has been reported as no longer on sale';
    }
    if (this.isPotentiallyDeleted) {
      return 'This item may no longer be on sale';
    }
    return 'Report discount issue';
  }

  getRRPFluctuatingBadgeTooltip(): string {
    return 'RRP Inflation Alert: This item\'s RRP has fluctuated up and down, indicating the discount may be artificially inflated.';
  }

  onReportNoLongerOnDiscountClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!this._item?.id) {
      return;
    }

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
      .subscribe((result) => {
        if (result) {
          this.userReportsService.reportSaleExpiry(this._item.id).subscribe({
            next: () => {
              this.statusDialogService
                .showSuccess(
                  'Report Submitted',
                  'Thank you for your report. We will review this discount issue and update the item if needed.',
                  'OK'
                )
                .subscribe(() => {
                  this.items.getItems();
                });
            },
          });
        }
      });
  }
}
