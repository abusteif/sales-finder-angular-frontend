import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UpdateType } from '../../core/models/item.model';

@Component({
  selector: 'app-price-change-icon-checkbox',
  standalone: false,
  templateUrl: './price-change-icon-checkbox.component.html',
  styleUrls: ['./price-change-icon-checkbox.component.css', '../icons.css']
})
export class PriceChangeIconCheckboxComponent {
  @Input() updateType!: UpdateType;
  @Input() checked: boolean = false;
  @Input() tooltipText: string = '';
  @Input() labelText: string = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  UpdateType = UpdateType;

  getIconClass(): string {
    switch (this.updateType) {
      case UpdateType.NEW:
        return 'fas fa-star new-items-icon';
      case UpdateType.DISCOUNT_UP:
        return 'fas fa-arrow-up discount-up-icon';
      case UpdateType.DISCOUNT_DOWN:
        return 'fas fa-arrow-down discount-down-icon';
      case UpdateType.RETURNED:
        return 'fas fa-undo returned-icon';
      default:
        return '';
    }
  }

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.checkedChange.emit(checkbox.checked);
  }
}

