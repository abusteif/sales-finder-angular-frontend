import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemCardComponent } from './item-card/item-card.component';
import { ItemsTableComponent } from './items-table/items-table.component';
import { SharedModule } from '../../shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    ItemCardComponent,
    ItemsTableComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTooltipModule
  ],
  exports: [
    ItemCardComponent,
    ItemsTableComponent
  ],
})
export class ItemDisplayModule { }
