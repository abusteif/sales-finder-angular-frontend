import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BottomSectionModule } from './features/bottom-section/bottom-section.module';
import { PagesModule } from './pages/pages.module';
import { provideHttpClient } from '@angular/common/http';
import { TopSectionModule } from './features/top-section/top-section.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BottomSectionModule,
    PagesModule,
    TopSectionModule,
    SharedModule,
  ],
  providers: [
    provideHttpClient() 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
