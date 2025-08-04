import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFieldComponent } from './auth-field/auth-field.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { SignupFormComponent } from './signup-form/signup-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AuthFieldComponent,
    LoginFormComponent,
    SignupFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    AuthFieldComponent,
    LoginFormComponent,
    SignupFormComponent
  ]
})
export class AuthenticationModule { }
