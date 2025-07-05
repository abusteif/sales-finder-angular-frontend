import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MainTopSectionComponent } from './main-top-section/main-top-section.component';
import { SharedModule } from '../../shared/shared.module';
import { FilterSearchModalComponent } from './filter-search-modal/filter-search-modal.component';
import { SliderComponent } from './slider/slider.component';
import { SortModalComponent } from './sort-modal/sort-modal.component';
import { ControlRibbonComponent } from './control-ribbon/control-ribbon.component';
import { ItemPerPageComponent } from './item-per-page/item-per-page.component';

@NgModule({
  declarations: [
    MainTopSectionComponent,
    FilterSearchModalComponent,
    SliderComponent,
    SortModalComponent,
    ControlRibbonComponent,
    ItemPerPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatSliderModule,
  ],
  exports: [
    MainTopSectionComponent
  ]
})
export class TopSectionModule { }
