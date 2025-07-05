import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITEMS_PER_PAGE_OPTIONS } from '../../../core/constants/display';

@Component({
  selector: 'app-item-per-page',
  standalone: false,
  templateUrl: './item-per-page.component.html',
  styleUrl: './item-per-page.component.css'
})
export class ItemPerPageComponent {
  @Input() itemsPerPage: number = 0;
  @Output() itemsPerPageChange = new EventEmitter<number>();

  isDropdownOpen = false;
  
  itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectItemsPerPage(value: number) {
    this.itemsPerPage = value;
    this.isDropdownOpen = false;
    this.itemsPerPageChange.emit(value);
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
