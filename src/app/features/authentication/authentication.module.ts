import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFieldComponent } from './auth-field/auth-field.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AuthFieldComponent,
    LoginFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    AuthFieldComponent,
    LoginFormComponent
  ]
})
export class AuthenticationModule { }
