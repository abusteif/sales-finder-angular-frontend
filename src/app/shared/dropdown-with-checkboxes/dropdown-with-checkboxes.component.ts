import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { TextService } from '../../core/services/text.service';

@Component({
  selector: 'app-dropdown-with-checkboxes',
  standalone: false,
  templateUrl: './dropdown-with-checkboxes.component.html',
  styleUrl: './dropdown-with-checkboxes.component.css'
})
export class DropdownWithCheckboxesComponent {
  @Input()
  get options(): any[] {
    return this._options;
  }
  set options(value: any[]) {
    if (this.maxSelectedOptions >= value.length) {
      this._options = ['All', ...value];
    }
    else {
      this._options = value;
    }
  }
  @Output() selectedOptionChange = new EventEmitter<string[]>();
  @Input() dropdownItemType: string = '';
  @Input() width: number = 250;
  @Input() selectedOptions: string[] = [];
  @Input() maxSelectedOptions: number = 0;
  private _options: any[] = [];

  isActive = false;

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) { 
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isActive) {
      this.isActive = false;
    }
  }

  onOptionChange(option: string, event: Event) {
    event.preventDefault();
    if (option === 'All') {
      if (this.selectedOptions.length === this.options.length - 1) {
        this.selectedOptions = [];
      }
      else {
        this.selectedOptions = this._options;
      }
    }
    else {
      if (this.selectedOptions.includes('All')) {
        this.selectedOptions = this.selectedOptions.filter(o => o !== 'All' && o !== option);
      }
      else {
        if (!this.selectedOptions.includes(option)) {
          this.selectedOptions.push(option);
        } else {
          this.selectedOptions = this.selectedOptions.filter(o => o !== option);
        }
      }

    }
    if (this.selectedOptions.includes('All')) {
      this.selectedOptionChange.emit(this.options.filter(o => o !== 'All'));
    }
    else {
      this.selectedOptionChange.emit(this.selectedOptions);
    }
  }

  isDisabled(option: string) {
    if (this.maxSelectedOptions > 0) {
      return this.selectedOptions.length >= this.maxSelectedOptions && !this.selectedOptions.includes(option);
    }
    return false;
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isActive = !this.isActive;
  }

  closeDropdown() {
    this.isActive = false;
  }

  dropdownText() {
    if (this.selectedOptions.length > 0) {
      if (this.selectedOptions.length === this.options.length) {
        return 'All';
      } else if (this.selectedOptions.length > 1) {
        return 'Multiple Selections';
      } else {
        return this.selectedOptions[0];
      }
    }
    else {
      return `Select ${this.dropdownItemType}`;
    }
  }
}
