import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CARDS_PER_ROW_OPTIONS, DEFAULT_CARDS_PER_ROW, DEFAULT_ITEMS_PER_PAGE, ITEMS_PER_PAGE_OPTIONS } from '../../../core/constants/display';

@Component({
    selector: 'app-display-settings-modal',
    standalone: false,
    templateUrl: './display-settings-modal.component.html',
    styleUrl: './display-settings-modal.component.css'
})
export class DisplaySettingsModalComponent implements OnInit, OnChanges {
    @Input() showModal: boolean = false;
    @Input() itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE;
    @Input() cardsPerRow: number = DEFAULT_CARDS_PER_ROW;
    @Output() onCloseModal = new EventEmitter<void>();
    @Output() itemsPerPageChange = new EventEmitter<number>();
    @Output() cardsPerRowChange = new EventEmitter<number>();
    @Output() onApply = new EventEmitter<void>();

    itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS;
    cardsPerRowOptions = CARDS_PER_ROW_OPTIONS;

    // Temporary variables to hold new values before applying
    tempItemsPerPage: number = DEFAULT_ITEMS_PER_PAGE;
    tempCardsPerRow: number = DEFAULT_CARDS_PER_ROW;

    ngOnInit() {
        // Initialize temporary variables with current values when modal opens
        this.tempItemsPerPage = this.itemsPerPage;
        this.tempCardsPerRow = this.cardsPerRow;
    }

    ngOnChanges() {
        // Update temporary variables when inputs change
        this.tempItemsPerPage = this.itemsPerPage;
        this.tempCardsPerRow = this.cardsPerRow;
    }

    closeModal() {
        this.onCloseModal.emit();
    }

    apply() {
        // Emit the temporary values when applying
        this.itemsPerPageChange.emit(this.tempItemsPerPage);
        this.cardsPerRowChange.emit(this.tempCardsPerRow);
        this.closeModal();
        this.onApply.emit();
    }

    onItemsPerPageChange(value: number) {
        this.tempItemsPerPage = value;
    }

    onCardsPerRowChange(value: number) {
        this.tempCardsPerRow = value;
    }
}
