import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { of } from 'rxjs';
import { delay, distinctUntilChanged, debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { DEFAULT_SORT_VALUE } from '../../../core/constants/sort';

@Component({
  selector: 'app-home-controls-ribbon',
  standalone: false,
  templateUrl: './home-controls-ribbon.component.html',
  styleUrl: './home-controls-ribbon.component.css'
})
export class HomeControlsRibbonComponent implements AfterViewInit, OnDestroy {

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

  private destroy$ = new Subject<void>();

  ngAfterViewInit() {
    // Set up the debounced search using RxJS
    if (this.searchInput) {
      fromEvent(this.searchInput.nativeElement, 'input')
        .pipe(
          map((event: any) => event.target.value),
          debounceTime(500),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe((value: string) => {
          this.searchValue = value;
          this.onSearchChange.emit(value);
        });
    }
  }

  filterClickHandler() {
    this.onFilterClick.emit();
  }

  sortClickHandler() {
    this.onSortClick.emit();
  }

  refreshClickHandler() {
    this.onRefreshClick.emit();
  }

  itemsPerPageChange(itemsPerPage: number) {
    this.onItemsPerPageChange.emit(itemsPerPage);
  }

  handleNewItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.newItemsOnly = checkbox.checked;
    this.onNewItemsOnlyChange.emit(this.newItemsOnly);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

