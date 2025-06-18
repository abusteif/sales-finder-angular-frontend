import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SortOption } from '../../../core/models/sort.model';

@Component({
  selector: 'app-sort-modal',
  standalone: false,
  templateUrl: './sort-modal.component.html',
  styleUrl: './sort-modal.component.css'
})
export class SortModalComponent {
  @Input() showSortModal: boolean = false;
  @Input() isAiSearch: boolean = false;
  @Input() sortOptions: SortOption[] = [];
  @Input() selectedSort: string = 'date_desc';
  @Output() onCloseSortModal = new EventEmitter<void>();
  @Output() onSortChange = new EventEmitter<string>();
  @Output() onApplySort = new EventEmitter<void>();

  openSortModal() {
    this.showSortModal = true;
  }

  closeSortModal() {
    this.showSortModal = false;
    this.onCloseSortModal.emit();
  }

  sortChange(sortOption: string) {
    this.selectedSort = sortOption;
    this.onSortChange.emit(sortOption);
  }

  applySort() {
    this.onApplySort.emit();
    this.closeSortModal();
  }
}
