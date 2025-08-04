import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { BottomSectionModule } from '../features/bottom-section/bottom-section.module';
import { TopSectionModule } from '../features/top-section/top-section.module';
import { AuthenticationModule } from '../features/authentication/authentication.module';
import { SharedModule } from '../shared/shared.module';
import { AlertsPageComponent } from './alerts-page/alerts-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { ActivationConfirmationPageComponent } from './activation-confirmation-page/activation-confirmation-page.component';
import { AccountActivationPageComponent } from './account-activation-page/account-activation-page.component';
import { AlertsModule } from '../features/alerts/alerts.module';

@NgModule({
  declarations: [
    HomePageComponent,
    LoginPageComponent,
    AlertsPageComponent,
    ProfilePageComponent,
    SignupPageComponent,
    ActivationConfirmationPageComponent,
    AccountActivationPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BottomSectionModule,
    TopSectionModule,
    AuthenticationModule,
    SharedModule,
    AlertsModule
  ],
  exports: [
    HomePageComponent,
    LoginPageComponent
  ],
})
export class PagesModule { }
