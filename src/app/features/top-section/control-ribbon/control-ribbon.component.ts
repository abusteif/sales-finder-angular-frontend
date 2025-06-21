import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { of } from 'rxjs';
import { delay, distinctUntilChanged, debounceTime, filter, map } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { DEFAULT_SORT_VALUE } from '../../../core/constants/sort';

@Component({
  selector: 'app-control-ribbon',
  standalone: false,
  templateUrl: './control-ribbon.component.html',
  styleUrl: './control-ribbon.component.css'
})
export class ControlRibbonComponent {

  @Output() onFilterClick = new EventEmitter<void>();
  @Output() onSortClick = new EventEmitter<void>();
  @Output() onRefreshClick = new EventEmitter<void>();
  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onAiSearchClick = new EventEmitter<void>();
  @Output() onNewItemsOnlyChange = new EventEmitter<boolean>();

  @Input() isFilterActive: boolean = false;
  @Input() isSortActive: boolean = false;
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

  handleNewItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.newItemsOnly = checkbox.checked;
    this.onNewItemsOnlyChange.emit(this.newItemsOnly);
  }

}

