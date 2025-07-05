import { Component, Input, ViewChild } from '@angular/core';
import { Item, UpdateType } from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';
import { AppStore } from '../../../state/app.store';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
})
export class ItemCardComponent {
  @ViewChild(MatTooltip) tooltip!: MatTooltip;
  
  _item: Item = {} as Item
  lastCheckedAt: Date = new Date()
  updatedAt: Date = new Date()
  updateType: UpdateType = UpdateType.ALL
  UpdateType = UpdateType
  isMobile: boolean = false;

  constructor(private appStore: AppStore) {
    this.isMobile = this.appStore.isMobile()
  }

  getTitleClass(): string {
    return this.isMobile ? 'title is-8 card-title' : 'title is-6  card-title';
  }

  @Input() set item(item: Item) {
    this._item = item
    this.camelCamelCamelUrl = this.generateCamelCamelCamelUrl()
    this.updateType = item.updateType
    this.updatedAt = item.updatedAt
  }
  @Input() set storesCheckedAt(storesCheckedAt: {name: string, checkedAt: Date}[]) {
    this.lastCheckedAt = storesCheckedAt.filter(store => store.name === this._item.store)[0]?.checkedAt
  }
  get item() {
    return this._item
  }
  camelCamelCamelUrl: string = ''

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
      default:
        return '';
    }
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

  }
