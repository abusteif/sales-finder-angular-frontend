import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalkthroughPurposeSelectionStepComponent } from './walkthrough-purpose-selection-step/walkthrough-purpose-selection-step.component';
import { WalkthroughCategoriesStepComponent } from './walkthrough-categories-step/walkthrough-categories-step.component';
import { WalkthroughAlertCreationStepComponent } from './walkthrough-alert-creation-step/walkthrough-alert-creation-step.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    WalkthroughPurposeSelectionStepComponent,
    WalkthroughCategoriesStepComponent,
    WalkthroughAlertCreationStepComponent
  ],
  imports: [CommonModule, SharedModule],
  exports: [
    WalkthroughPurposeSelectionStepComponent,
    WalkthroughCategoriesStepComponent,
    WalkthroughAlertCreationStepComponent
  ],
})
export class WalkthroughModule {}
