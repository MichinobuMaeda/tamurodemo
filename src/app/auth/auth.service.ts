import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class AuthService {

  private _sess = {};

  constructor(private _http: Http) {}

  isSignedIn() {
    if ('user_id' in this._sess) {
      return true;
    } else {
      return this._http.get(
        'api/my_session', { withCredentials: true }
      ).toPromise()
      .then(res => {
        this._sess = res.json()
        return 'user_id' in this._sess;
      });
    }
  }

  hasToken() {
    return 'provider' in this._sess && this._sess['provider'] == 'token';
  }

  isManager() {
    return 'is_manager' in this._sess && this._sess['is_manager'];
  }

  isAdmin() {
    return 'is_admin' in this._sess && this._sess['is_admin'];
  }

  userId() {
    return 'user_id' in this._sess && this._sess['user_id'];
  }

  login(username, password) {
    this._sess = {};
  }

  logout() {
    this._sess = {};
  }
}
