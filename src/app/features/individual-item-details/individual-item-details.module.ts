import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceChartComponent } from './price-chart/price-chart.component';
import { MultiItemPriceChartComponent } from './multi-item-price-chart/multi-item-price-chart.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    PriceChartComponent,
    MultiItemPriceChartComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    PriceChartComponent,
    MultiItemPriceChartComponent,
  ],
})
export class IndividualItemDetailsModule { }

