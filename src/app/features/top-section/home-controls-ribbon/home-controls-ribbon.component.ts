import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, Input, OnDestroy } from '@angular/core';
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
export class HomeControlsRibbonComponent implements AfterViewInit, OnDestroy {

  @Output() onFilterClick = new EventEmitter<void>();
  @Output() onSortClick = new EventEmitter<void>();
  @Output() onRefreshClick = new EventEmitter<void>();
  @Output() onSearchChange = new EventEmitter<string>();
  @Output() onAiSearchClick = new EventEmitter<void>();
  @Output() onNewItemsOnlyChange = new EventEmitter<boolean>();
  @Output() onDiscountUpItemsOnlyChange = new EventEmitter<boolean>();
  @Output() onItemsWithHighestDiscountChange = new EventEmitter<boolean>();
  @Output() onDisplaySettingsClick = new EventEmitter<void>();
  @Output() onItemsPerPageChange = new EventEmitter<number>();
  @Output() onCardsPerRowChange = new EventEmitter<number>();
  @Output() onDisplaySettingsApply = new EventEmitter<void>();

  @Input() isFilterActive: boolean = false;
  @Input() isSortActive: boolean = false;
  @Input() itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE;
  @Input() cardsPerRow: number = DEFAULT_CARDS_PER_ROW;

  searchValue: string = '';
  showDisplayModal: boolean = false;
  checboxes = [
    {
      name: 'New Items Only',
      checked: false
    },
    {
      name: 'Discount Up Items Only',
      checked: false
    },
    {
      name: 'Items With Highest Discount',
      checked: false
    }
  ]
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

  itemsPerPageChange(itemsPerPage: number) {
    this.onItemsPerPageChange.emit(itemsPerPage);
  }

  cardsPerRowChange(cardsPerRow: number) {
    this.onCardsPerRowChange.emit(cardsPerRow);
  }

  handleNewItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.handleCheckboxChange('New Items Only');
    this.onNewItemsOnlyChange.emit(checkbox.checked);
  }
  handleDiscountUpItemsOnlyChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.handleCheckboxChange('Discount Up Items Only');
    this.onDiscountUpItemsOnlyChange.emit(checkbox.checked);
  }
  handleItemsWithHighestDiscountChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.handleCheckboxChange('Items With Highest Discount');
    this.onItemsWithHighestDiscountChange.emit(checkbox.checked);
  }

  isCheckboxChecked(name: string) {
    return this.checboxes.find(checkbox => checkbox.name === name)?.checked ?? false;
  }
  handleCheckboxChange(name: string) {
    this.checboxes.filter(checkbox => checkbox.name !== name).forEach(checkbox => checkbox.checked = false);
    const checkbox = this.checboxes.find(checkbox => checkbox.name === name);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

