import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertItemComponent } from './alert-item/alert-item.component';
import { AlertListComponent } from './alert-list/alert-list.component';
import { SharedModule } from '../../shared/shared.module';  
import { AlertsControlsRibbonComponent } from './alerts-controls-ribbon/alerts-controls-ribbon.component';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { SearchTextStepComponent } from './alert-creation-steps/search-text-step/search-text-step.component';
import { StoreSelectionStepComponent } from './alert-creation-steps/store-selection-step/store-selection-step.component';
import { PriceDiscountRangeStepComponent } from './alert-creation-steps/price-discount-range-step/price-discount-range-step.component';
import { SpecialNameTitlecasePipe } from '../../shared/special-name-titlecase.pipe';
import { SummaryStepComponent } from './alert-creation-steps/summary-step/summary-step.component';
import { AlertItemDetailsComponent } from './alert-item-details/alert-item-details.component';
import { AlertItemResultsComponent } from './alert-item-results/alert-item-results.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ItemLinkStepComponent } from './alert-creation-steps/item-link-step/item-link-step.component';

@NgModule({
  declarations: [
    AlertItemComponent,
    AlertListComponent,
    AlertsControlsRibbonComponent,
    AlertModalComponent,
    SearchTextStepComponent,
    StoreSelectionStepComponent,
    PriceDiscountRangeStepComponent,
    SummaryStepComponent,
    AlertItemDetailsComponent,
    AlertItemResultsComponent,
    ItemLinkStepComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MatTooltipModule
  ],
  providers: [
    SpecialNameTitlecasePipe
  ],
  exports: [
    AlertListComponent,
    AlertsControlsRibbonComponent,
    AlertModalComponent
  ]
})
export class AlertsModule { }
