import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainBottomSectionComponent } from './main-bottom-section/main-bottom-section.component';
import { ItemDisplayModule } from '../item-display/item-display.module';
import { PaginationComponent } from './pagination/pagination.component';


@NgModule({
  declarations: [
    MainBottomSectionComponent,
    PaginationComponent,
  ],
  imports: [
    CommonModule,
    ItemDisplayModule
  ],
  exports: [
    MainBottomSectionComponent,
  ],
})
export class BottomSectionModule { }
