import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AlertsPageComponent } from './pages/alerts-page/alerts-page.component';
import { authGuard, publicGuard } from './core/guards';

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
