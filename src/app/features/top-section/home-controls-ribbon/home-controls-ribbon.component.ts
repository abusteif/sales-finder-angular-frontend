import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { of } from 'rxjs';
import { delay, distinctUntilChanged, debounceTime, filter, map } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { DEFAULT_SORT_VALUE } from '../../../core/constants/sort';

@Component({
  selector: 'app-home-controls-ribbon',
  standalone: false,
  templateUrl: './home-controls-ribbon.component.html',
  styleUrl: './home-controls-ribbon.component.css'
})
export class HomeControlsRibbonComponent {

  @Output() onFilterClick = new EventEmitter<void>();
  @Output() onSortClick = new EventEmitter<void>();
  @Output() onRefreshClick = new EventEmitter<void>();
  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onAiSearchClick = new EventEmitter<void>();
  @Output() onNewItemsOnlyChange = new EventEmitter<boolean>();
  @Output() onItemsPerPageChange = new EventEmitter<number>();

  @Input() isFilterActive: boolean = false;
  @Input() isSortActive: boolean = false;
  @Input() itemsPerPage: number = 0;
  searchValue: string = '';
  newItemsOnly: boolean = false;

  @ViewChild('searchInput') searchInput!: ElementRef;

  filterClickHandler() {
    this.onFilterClick.emit();
  }

  sortClickHandler() {
    this.onSortClick.emit();
  }

  refreshClickHandler() {
    this.onRefreshClick.emit();
  }

  searchChangeHandler(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value;
  }

  searchClickHandler() {
    this.onSearchChange.emit(this.searchValue);
    this.searchInput.nativeElement.blur();
  }

  onSearchClear(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      this.searchValue = '';
      this.onSearchChange.emit('');
    }
  }

  itemsPerPageChange(itemsPerPage: number) {
    this.onItemsPerPageChange.emit(itemsPerPage);
  }

  handleNewItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.newItemsOnly = checkbox.checked;
    this.onNewItemsOnlyChange.emit(this.newItemsOnly);
  }

}

