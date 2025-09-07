import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MainTopSectionComponent } from './main-top-section/main-top-section.component';
import { SharedModule } from '../../shared/shared.module';
import { FilterSearchModalComponent } from './filter-search-modal/filter-search-modal.component';
import { SortModalComponent } from './sort-modal/sort-modal.component';
import { HomeControlsRibbonComponent } from './home-controls-ribbon/home-controls-ribbon.component';
import { ItemPerPageComponent } from './item-per-page/item-per-page.component';

@NgModule({
  declarations: [
    MainTopSectionComponent,
    FilterSearchModalComponent,
    SortModalComponent,
    HomeControlsRibbonComponent,
    ItemPerPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatSliderModule,
    MatTooltipModule,
  ],
  exports: [
    MainTopSectionComponent,
    HomeControlsRibbonComponent
  ]
})
export class TopSectionModule { }
