import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { ActivationConfirmationPageComponent } from './pages/activation-confirmation-page/activation-confirmation-page.component';
import { AccountActivationPageComponent } from './pages/account-activation-page/account-activation-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AlertsPageComponent } from './pages/alerts-page/alerts-page.component';
import { authGuard, publicGuard, ActivationConfirmationGuard } from './core/guards';

const routes: Routes = [
  {
    path: '', 
    component: HomePageComponent, 
    pathMatch: 'full'
  },
  {
    path: 'login', 
    component: LoginPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard]
  },
  {
    path: 'signup', 
    component: SignupPageComponent, 
    pathMatch: 'full',
    canActivate: [publicGuard]
  },
  {
    path: 'activation-confirmation', 
    component: ActivationConfirmationPageComponent, 
    pathMatch: 'full',
    canActivate: [ActivationConfirmationGuard]
  },
  {
    path: 'verify-email', 
    component: AccountActivationPageComponent, 
    pathMatch: 'full'
  },
  {
    path: 'profile', 
    component: ProfilePageComponent, 
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'alerts', 
    component: AlertsPageComponent, 
    pathMatch: 'full',
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
