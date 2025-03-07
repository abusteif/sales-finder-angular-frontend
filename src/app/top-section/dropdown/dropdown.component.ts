import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() name: string = '';

  items = ['Option 1', 'Option 2', 'Option 3'];
  selectedItem: string = '';

  selectItem(item: string) {
    this.selectedItem = item;
    console.log(this.selectedItem);
  }
}
