import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdditionalButton } from '../../core/models/modal.model';

@Component({
  selector: 'app-base-modal',
  standalone: false,
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.css',
})
export class BaseModalComponent {
  @Input() showModal: boolean = false;
  @Input() title: string = '';
  @Input() modalHeight: string = 'auto';
  @Input() applyButtonText: string = 'Apply';
  @Input() applyButtonDisabled: boolean = false;
  @Input() cancelButtonText: string = 'Cancel';
  @Input() additionalButton: AdditionalButton | null = null;
  @Output() onCloseModal = new EventEmitter<void>();
  @Output() onApply = new EventEmitter<void>();
  @Output() onAdditionalButtonClick = new EventEmitter<void>();

  closeModal() {
    this.onCloseModal.emit();
  }
  apply() {
    this.onApply.emit();
  }
  additionalButtonClick() {
    this.onAdditionalButtonClick.emit();
  }
}
