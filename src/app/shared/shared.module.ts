import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TruncatePipe } from './truncate.pipe';
import { RelativeDatePipe } from './relative-date.pipe';
import { DropdownComponent } from './dropdown/dropdown.component';
import { DropdownWithCheckboxesComponent } from './dropdown-with-checkboxes/dropdown-with-checkboxes.component';
import { BaseModalComponent } from './base-modal/base-modal.component';
import { RadioButtonItemComponent } from './radio-button-item/radio-button-item.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LogoComponent } from './logo/logo.component';
import { SpecialNameTitlecasePipe } from './special-name-titlecase.pipe';
import { ControlsRibbonComponent } from './controls-ribbon/controls-ribbon.component';
import { SliderComponent } from '../features/top-section/slider/slider.component';
import { StatusDialogComponent } from './status-dialog/status-dialog.component';

@NgModule({
  declarations: [
    TruncatePipe, 
    RelativeDatePipe, 
    DropdownComponent, 
    DropdownWithCheckboxesComponent, 
    BaseModalComponent, 
    RadioButtonItemComponent, 
    NavbarComponent, 
    LogoComponent, 
    SpecialNameTitlecasePipe, 
    ControlsRibbonComponent,
    SliderComponent,
    StatusDialogComponent
  ],
  imports: [
    CommonModule, 
    FormsModule,
    MatSliderModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    TruncatePipe, 
    RelativeDatePipe, 
    DropdownComponent, 
    DropdownWithCheckboxesComponent, 
    BaseModalComponent, 
    RadioButtonItemComponent, 
    NavbarComponent, 
    LogoComponent, 
    SpecialNameTitlecasePipe, 
    ControlsRibbonComponent,
    SliderComponent,
    StatusDialogComponent
  ]
})
export class SharedModule { }
