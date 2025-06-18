import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-radio-button-item',
  standalone: false,
  templateUrl: './radio-button-item.component.html',
  styleUrl: './radio-button-item.component.css'
})
export class RadioButtonItemComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() selected: string = '';
  @Input() disabled: boolean = false;
  @Output() selectedChange = new EventEmitter<string>();

  onSelectedChange(selected: string) {
    this.selectedChange.emit(selected);
  }
}
