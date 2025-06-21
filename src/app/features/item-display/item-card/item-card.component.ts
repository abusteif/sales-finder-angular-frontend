import { Component, Input } from '@angular/core';
import { Item, UpdateType } from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
})
export class ItemCardComponent {
  _item: Item = {} as Item
  lastCheckedAt: Date = new Date()
  updatedAt: Date = new Date()
  updateType: UpdateType = UpdateType.ALL
  UpdateType = UpdateType
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
