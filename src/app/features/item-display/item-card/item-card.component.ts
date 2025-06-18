import { Component, Input } from '@angular/core';
import { Item } from '../../../core/models/item.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-item-card',
  standalone: false,
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
})
export class ItemCardComponent {
  _item: Item = {} as Item
  @Input() set item(item: Item) {
    this._item = item
    this.camelCamelCamelUrl = this.generateCamelCamelCamelUrl()
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
}
