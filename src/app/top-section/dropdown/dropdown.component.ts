import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Picker } from '../../models/top-section.models';

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule, SelectModule, FormsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})



export class DropdownComponent {
  @Input() name: string = '';
  @Input() dropdownName: string = '';
  @Input() items: Picker[] | undefined;

  @Output() itemSelected = new EventEmitter<string>();

  selectedItem: Picker | undefined;

  // ngOnInit() {
  //     this.items = [
  //         { name: 'New York', code: 'NY' },
  //         { name: 'Rome', code: 'RM' },
  //         { name: 'London', code: 'LDN' },
  //         { name: 'Istanbul', code: 'IST' },
  //         { name: 'Paris', code: 'PRS' }
  //     ];
  // }
  onClick() {
    console.log(this.selectedItem);
    this.itemSelected.emit(this.selectedItem?.code);
  }
}
