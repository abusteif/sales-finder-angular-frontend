import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCardComponent } from './item-card/item-card.component';
import { ItemsTableComponent } from './items-table/items-table.component';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    ItemCardComponent,
    ItemsTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    ItemCardComponent,
    ItemsTableComponent
  ],
})
export class ItemDisplayModule { }
