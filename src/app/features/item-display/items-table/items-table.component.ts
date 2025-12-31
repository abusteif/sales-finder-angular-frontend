import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Item } from '../../../core/models/item.model';
import { UserRole } from '../../../core/models/user.models';

export const clearSearchCriteriaSignal = signal<boolean>(false);

@Component({
  selector: 'app-items-table',
  standalone: false,
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.css']
})
export class ItemsTableComponent {
  @Input() alertLimitReached: boolean = false;
  @Input() items: Item[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() storesCheckedAt: {name: string, checkedAt: Date}[] = []
  @Input() isAuthenticated: boolean = false;
  @Input() cardsPerRow: number = 3;
  @Input() userRole: UserRole = UserRole.USER;
  @Input() isItemSelectionMode: boolean = false;
  @Input() isMaxItemSelectionCountReached: boolean = false;
  @Input() selectedItems: Item[] = [];

  getColumnClass(): string {
    const desktopClass = 'is-one-fifth-desktop';
    switch (this.cardsPerRow) {
      case 1:
        return `is-full-mobile is-full-tablet ${desktopClass}`;
      case 2:
        return `is-half-mobile is-half-tablet ${desktopClass}`;
      case 3:
        return `is-one-third-mobile is-one-third-tablet ${desktopClass}`;
      default:
        return `is-one-third-mobile is-one-third-tablet ${desktopClass}`;
    }
  }
  clearSearchCriteria(): void {
    clearSearchCriteriaSignal.set(true);
  }

  isItemSelected(itemId: string): boolean {
    return this.selectedItems.some(item => item.id === itemId);
  }

}
