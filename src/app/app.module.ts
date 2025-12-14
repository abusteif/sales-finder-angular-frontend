import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BottomSectionModule } from './features/bottom-section/bottom-section.module';
import { PagesModule } from './pages/pages.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TopSectionModule } from './features/top-section/top-section.module';
import { SharedModule } from './shared/shared.module';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    BottomSectionModule,
    PagesModule,
    TopSectionModule,
    SharedModule,
  ],
  providers: [provideHttpClient(withInterceptors([credentialsInterceptor]))],
  bootstrap: [AppComponent],
})
export class AppModule {}
