import { Component, Input, HostListener, OnInit } from '@angular/core';
import { Item, UpdateType } from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
})
export class ItemCardComponent implements OnInit {
  _item: Item = {} as Item
  lastCheckedAt: Date = new Date()
  updatedAt: Date = new Date()
  updateType: UpdateType = UpdateType.ALL
  UpdateType = UpdateType
  isMobile: boolean = false;
  is2K: boolean = false;
  is4K: boolean = false;
  isDesktop: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (window.innerHeight > 1320) {
      this.is4K = true;
    } else if (window.innerHeight > 1080) {
      this.is2K = true;
    } else if (window.innerHeight > 768) {
      this.isDesktop = true;
    } else {
      this.isMobile = true;
    }
    console.log(this.is4K, this.is2K, this.isDesktop, this.isMobile);
  }

  getTitleClass(): string {
    return this.isMobile ? 'title is-7 card-title' : 'title is-6  card-title';
  }
  getCardHeightClass(): string {
    if (this.isMobile) {
      return 'is-1by1';
    } else {
      return 'is-5by4';
    }

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

}
