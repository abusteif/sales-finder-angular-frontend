import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from './truncate.pipe';
import { RelativeDatePipe } from './relative-date.pipe';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DropdownWithCheckboxesComponent } from './dropdown-with-checkboxes/dropdown-with-checkboxes.component';
import { BaseModalComponent } from './base-modal/base-modal.component';
import { RadioButtonItemComponent } from './radio-button-item/radio-button-item.component';
import { NavbarComponent } from './navbar/navbar.component';
@NgModule({
  declarations: [TruncatePipe, RelativeDatePipe, DropdownComponent, DropdownWithCheckboxesComponent, BaseModalComponent, RadioButtonItemComponent, NavbarComponent], // Declare the pipe
  imports: [CommonModule, FormsModule],
  exports: [TruncatePipe, RelativeDatePipe, DropdownComponent, DropdownWithCheckboxesComponent, BaseModalComponent, RadioButtonItemComponent, NavbarComponent]    // Export the pipe
})
export class SharedModule { }
