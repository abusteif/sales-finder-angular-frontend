import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { TextService } from '../../core/services/text.service';
@Component({
  selector: 'app-dropdown',
  standalone: false,
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() options: any[] = [];
  @Input() selectedOption: string = '';
  @Output() selectedOptionChange = new EventEmitter<string>();
  @Input() dropdownItemType: string = '';
  @Input() width: number = 250;

  isActive = false;

  constructor(private elementRef: ElementRef, private textService: TextService) {}

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isActive = false;
    }
  }

  onOptionChange(option: string, event: Event) {
    event.preventDefault();
    this.selectedOption = option; 
    this.selectedOptionChange.emit(option);
    this.isActive = false;
  }

  toggleDropdown() {
    this.isActive = !this.isActive;
  }

  closeDropdown() {
    this.isActive = false;
  }

  dropdownText() {
    const dropdownText = this.selectedOption || `Select ${this.dropdownItemType.toLowerCase()}`;
    return this.textService.capitalizeWords(dropdownText);
  }
}
