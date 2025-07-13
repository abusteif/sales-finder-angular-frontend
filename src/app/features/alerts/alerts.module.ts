import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertItemComponent } from './alert-item/alert-item.component';
import { AlertListComponent } from './alert-list/alert-list.component';



@NgModule({
  declarations: [
    AlertItemComponent,
    AlertListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AlertListComponent
  ]
})
export class AlertsModule { }
