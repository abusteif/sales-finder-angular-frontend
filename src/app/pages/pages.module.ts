import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { PasswordResetConfirmPageComponent } from './password-reset-confirm-page/password-reset-confirm-page.component';
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import { UpgradePageComponent } from './upgrade-page/upgrade-page.component';
import { AdminBasePageComponent } from './admin-base-page/admin-base-page.component';
import { ContactUsPageComponent } from './contact-us-page/contact-us-page.component';
import { FaqPageComponent } from './faq-page/faq-page.component';
import { AboutUsPageComponent } from './about-us-page/about-us-page.component';
import { ItemDetailsPageComponent } from './item-details-page/item-details-page.component';
import { ComparePageComponent } from './compare-page/compare-page.component';
import { AlertsModule } from '../features/alerts/alerts.module';
import { IndividualItemDetailsModule } from '../features/individual-item-details/individual-item-details.module';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { WalkthroughPageComponent } from './walkthrough-page/walkthrough-page.component';
import { WalkthroughModule } from '../features/walkthrough/walkthrough.module';

@NgModule({
  declarations: [
    HomePageComponent,
    LoginPageComponent,
    AlertsPageComponent,
    ProfilePageComponent,
    SignupPageComponent,
    ActivationConfirmationPageComponent,
    AccountActivationPageComponent,
    PasswordResetConfirmPageComponent,
    ForgotPasswordPageComponent,
    UpgradePageComponent,
    AdminBasePageComponent,
    ContactUsPageComponent,
    FaqPageComponent,
    AboutUsPageComponent,
    ItemDetailsPageComponent,
    ComparePageComponent,
    NotFoundPageComponent,
    LandingPageComponent,
    WalkthroughPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    BottomSectionModule,
    TopSectionModule,
    AuthenticationModule,
    SharedModule,
    AlertsModule,
    IndividualItemDetailsModule,
    WalkthroughModule
  ],
  exports: [
    HomePageComponent,
    LoginPageComponent,
    AdminBasePageComponent
  ],
})
export class PagesModule { }
