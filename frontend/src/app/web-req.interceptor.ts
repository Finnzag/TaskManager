import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, empty, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService) { }

  refreshingAccessToken: boolean = false;

  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    // call next() and handle response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if (error.status === 401) {
          // 401 unauthorised - App will try to refre4sh the auth token
          // if no valid refresh token exists in the database then the user will be logged out
          return this.refreshAccessToken()
          .pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((err: any) => {
              console.log(err);
              this.authService.logout();
              return EMPTY
            })
          )
        }

        return throwError(() => (error));
      })
    )
  }

  refreshAccessToken() {
    if (this.refreshingAccessToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          // this code will run one the access token has been resfreshed
          observer.next();
          observer.complete();
        })
      })
    } else {
      this.refreshingAccessToken = true;
    // call a method in the auth service to send a request to refresh the access token
      return this.authService.getNewAccessToken().pipe(
        tap(() => {
          console.log("Access Token refreshed!!!");
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next(null);
        })
      )
    }

    
  }

  addAuthHeader(request: HttpRequest<any>) {
    // get access token 
    const token = this.authService.getAccessToken();

    // append access token to the request header

    if (token) {
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      })
    }

    return request;
  }
}


