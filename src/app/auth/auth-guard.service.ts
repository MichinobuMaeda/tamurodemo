import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private _authService: AuthService, 
    private _router:Router
  ) {
  }

  async canActivate() {
    if (await this._authService.isSignedIn()) {
      if (this._authService.hasToken()) {
        this._router.navigate(['signup'])
        return false;
      } else {
        return true;
      }
    }

    this._router.navigate(['signin'])
    return false;
  }

}
