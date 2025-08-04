import { Component, EventEmitter, Input, Output } from '@angular/core';
import { alertConstants } from '../../../../core/constants/alert';

@Component({
  selector: 'app-search-text-step',
  standalone: false,
  templateUrl: './search-text-step.component.html',
  styleUrl: './search-text-step.component.css'
})
export class SearchTextStepComponent {
  @Input() itemName: string = '';
  @Input() maxCharacterLimit: number = alertConstants.maxCharacterLimit;
  @Input() minCharacterLimit: number = alertConstants.minCharacterLimit;
  @Input() exactMatch: boolean = false;
  @Input() aiSearch: boolean = false;
  @Output() itemNameChange = new EventEmitter<string>();
  @Output() enterKey = new EventEmitter<void>();
  @Output() exactMatchChange = new EventEmitter<boolean>();
  @Output() aiSearchChange = new EventEmitter<boolean>();

  onItemNameChange(event: any) {
    this.itemNameChange.emit(event.target.value);
  }

  onEnterKey() {
    this.enterKey.emit();
  }

  onExactMatchChange(event: any) {
    this.exactMatchChange.emit(event.target.checked);
  }

  onAiSearchChange(event: any) {
    this.aiSearchChange.emit(event.target.checked);
  }
  showSearchFeedback() {
    return this.itemName.trim().length > 0 && this.itemName.length < this.maxCharacterLimit && this.itemName.length >= this.minCharacterLimit;
  }
}
