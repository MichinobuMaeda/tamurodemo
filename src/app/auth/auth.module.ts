import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule }          from '@angular/http';

import { ShareModule } from '../share.module'
import { SignInComponent } from './signin.component';
import { SignUpComponent } from './signup.component';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';

@NgModule({
  imports: [
    ShareModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule
  ],
  declarations: [
    SignInComponent,
    SignUpComponent
  ],
  exports: [
  ],
  providers: [
    AuthService,
    AuthGuard
  ]
})
export class AuthModule { 
}
