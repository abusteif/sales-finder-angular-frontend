import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { BottomSectionModule } from '../features/bottom-section/bottom-section.module';
import { TopSectionModule } from '../features/top-section/top-section.module';


@NgModule({
  declarations: [
    HomePageComponent,
    LoginPageComponent
  ],
  imports: [
    CommonModule,
    BottomSectionModule,
    TopSectionModule
  ],
  exports: [
    HomePageComponent,
    LoginPageComponent
  ],
})
export class PagesModule { }
