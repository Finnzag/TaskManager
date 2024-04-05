import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap, pipe } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webservice: WebRequestService, private router: Router) { }

  login(email: string, password: string) {
    return this.webservice.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        // the auth token will be in the header of this response
        this.setSession(res.body._id, res.headers.get('x-access-token')!, res.headers.get('x-refresh-token')!);
        console.log('LOGGED IN');
      })
    )
  } 

  logout() {
    this.removeSession();
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  setRefreshToken(refreshToken: string) {
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  private setSession(userId: string, accessToken: string, refreshToken:string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('access-token', accessToken);
    localStorage.setItem('refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
  }

}