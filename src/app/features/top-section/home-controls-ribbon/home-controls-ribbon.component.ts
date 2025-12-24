import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { of } from 'rxjs';
import { delay, distinctUntilChanged, debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { DEFAULT_SORT_VALUE } from '../../../core/constants/sort';
import { DEFAULT_CARDS_PER_ROW, DEFAULT_ITEMS_PER_PAGE } from '../../../core/constants/display';


@Component({
  selector: 'app-home-controls-ribbon',
  standalone: false,
  templateUrl: './home-controls-ribbon.component.html',
  styleUrls: ['./home-controls-ribbon.component.css', '../../../shared/icons.css']
})
export class HomeControlsRibbonComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Output() onFilterClick = new EventEmitter<void>();
  @Output() onSortClick = new EventEmitter<void>();
  @Output() onRefreshClick = new EventEmitter<void>();
  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onAiSearchClick = new EventEmitter<void>();
  @Output() onFeaturedItemsChange = new EventEmitter<boolean>();
  @Output() onDisplaySettingsClick = new EventEmitter<void>();
  @Output() onItemsPerPageChange = new EventEmitter<number>();
  @Output() onCardsPerRowChange = new EventEmitter<number>();
  @Output() onDisplaySettingsApply = new EventEmitter<void>();

  @Input() isFilterActive: boolean = false;
  @Input() isSortActive: boolean = false;
  @Input() itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE;
  @Input() cardsPerRow: number = DEFAULT_CARDS_PER_ROW;
  @Input() isFeaturedItemsOnly: boolean = false;
  @Input() searchValue: string = '';

  showDisplayModal: boolean = false;
  @ViewChild('searchInput') searchInput!: ElementRef;

  private destroy$ = new Subject<void>();

  ngAfterViewInit() {
    // Set initial search value from input
    this.updateSearchInputValue();
    
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

  ngOnChanges(changes: SimpleChanges) {
    // Update input field when searchValue input changes (e.g., after navigation)
    if (changes['searchValue'] && !changes['searchValue'].firstChange && this.searchInput) {
      this.updateSearchInputValue();
    }
  }

  private updateSearchInputValue() {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = this.searchValue || '';
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

  displaySettingsClickHandler() {
    this.showDisplayModal = true;
    this.onDisplaySettingsClick.emit();
  }

  closeDisplayModal() {
    this.showDisplayModal = false;
  }

  applyDisplaySettings() {
    this.onDisplaySettingsApply.emit();
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    // Trigger the search with the current input value
    if (this.searchInput) {
      const currentValue = this.searchInput.nativeElement.value;
      this.searchValue = currentValue;
      this.onSearchChange.emit(currentValue);
      // Dismiss the keyboard by blurring the input
      this.searchInput.nativeElement.blur();
    }
  }

  itemsPerPageChange(itemsPerPage: number) {
    this.onItemsPerPageChange.emit(itemsPerPage);
  }

  cardsPerRowChange(cardsPerRow: number) {
    this.onCardsPerRowChange.emit(cardsPerRow);
  }

  handleFeaturedItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.onFeaturedItemsChange.emit(checkbox.checked);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

