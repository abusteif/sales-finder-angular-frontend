import { Component, Input, signal, ViewChild } from '@angular/core';
import { Item, UpdateType, ItemColour, ItemAlert } from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';
import { AppStore } from '../../../state/app.store';
import { MatTooltip } from '@angular/material/tooltip';
import { RelativeDatePipe } from '../../../shared/relative-date.pipe';
import { Router } from '@angular/router';

export const itemAlertSignal = signal<ItemAlert | null>(null)
@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css', '../../../shared/icons.css'],
  providers: [RelativeDatePipe]
})
export class ItemCardComponent {
  @ViewChild(MatTooltip) tooltip!: MatTooltip;

  @Input() alertLimitReached: boolean = false;
  @Input() set item(item: Item) {
    this._item = item
    this.camelCamelCamelUrl = this.generateCamelCamelCamelUrl()
    this.updateType = item.updateType
    this.updatedAt = item.updatedAt
    this.discountChange = item.discountChange
    this.colour = item.colour
    this.highestDiscountSince = item.highestDiscountSince || 0
    this.isHighestDiscountEver = item.isHighestDiscountEver || false
    this.trackedSince = item.trackedSince || 0
    this.isFlactuating = item.isFlactuating || false
    this.alertId = item.alertId || null 
    this._itemAlert = {
      alertId: this.alertId || '',
      item: this._item
    }
    this.googleUrl = this.generateGoogleUrl()
    this.imageLoadError = false // Reset image error on new item
  }
  @Input() set storesCheckedAt(storesCheckedAt: {name: string, checkedAt: Date}[]) {
    this.lastCheckedAt = storesCheckedAt.filter(store => store.name === this._item.store)[0]?.checkedAt
  }
  @Input() isAuthenticated: boolean = false;

  get item() {
    return this._item
  }
  
  _item: Item = {} as Item
  _itemAlert: ItemAlert = {} as ItemAlert
  lastCheckedAt: Date = new Date()
  updatedAt: Date = new Date()
  updateType: UpdateType = UpdateType.ALL
  discountChange: string = ''
  UpdateType = UpdateType
  isMobile: boolean = false;
  colour: ItemColour | null = null
  highestDiscountSince: number = 0
  isHighestDiscountEver: boolean = false
  trackedSince: number = 0
  isFlactuating: boolean = false
  alertId: string | null = null
  imageLoadError: boolean = false
  
  // Default shadow styles
  private readonly defaultShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
  private readonly defaultHoverShadow = '0 8px 16px rgba(0, 0, 0, 0.5)';


  constructor(private appStore: AppStore, private relativeDatePipe: RelativeDatePipe, private router: Router) {
    this.isMobile = this.appStore.isMobile()
  }

  onAlertButtonClick() {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.isAlertDisabled()) {
      itemAlertSignal.set(this._itemAlert)
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
    return this.isHighestDiscountEver || this.highestDiscountSince > 0
  }

  getDiscountIconText(): string {
    if (this.isHighestDiscountEver) {
      return '🔥';
    } else {
      return this.highestDiscountSince.toString();
    }
  }

  getDiscountIconTooltip(): string {
    if (this.isHighestDiscountEver) {
      return `Highest discount since we started tracking this item! (${this.trackedSince} days)`;
    } else {
      return `Highest discount in ${this.highestDiscountSince} days`;
    }
  }

  getDiscountIconClass(): string {
    const baseClass = 'discount-icon';
    const typeClass = this.isHighestDiscountEver ? 'discount-icon-highest' : 'discount-icon-days';
    return `${baseClass} ${typeClass}`;
  }


  camelCamelCamelUrl: string = ''
  googleUrl: string = ''
  generateGoogleUrl() {
    return `https://www.google.com/search?q=${this._item?.name}`;
  }
  generateCamelCamelCamelUrl() {
    const itemUrl = this._item?.url
    const splits = itemUrl?.split('/')
    const itemId = splits?.[splits?.length - 2]
    return `${environment.camelCamelCamelBaseUrl}/product/${itemId}`;
  }

  onStoreLogoHover() {
    if (!this.lastCheckedAt) return '';
    const date = new Date(this.lastCheckedAt);
    return `Last checked at ${date.toLocaleDateString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  getIndicatorClass(): string {
    const baseClass = 'indicator-base';
    const shapeClass = this.updateType === UpdateType.NEW ? 'indicator-pill' : 'indicator-circular';
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
      return `${this.discountChange}\n${this.relativeDatePipe.transform(this.updatedAt)}`;
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
    return this.isFlactuating
  }

  getVolatilityWarningTooltip(): string {
    return 'Price Alert: This item\'s price changes frequently, which may indicate a misleading discount';
  }

  isAlertDisabled(): boolean {
    return this.alertLimitReached && !this.alertId && this.isAuthenticated
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

  onImageError() {
    this.imageLoadError = true;
  }

  }
