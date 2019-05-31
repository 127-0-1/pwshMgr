import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { tap, catchError } from "rxjs/operators";
import { Observable, throwError } from 'rxjs';
import { ErrorDialogService } from '../error-dialog.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, public errorDialogService: ErrorDialogService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let accessToken = localStorage.getItem("token");
    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log("this is coming from the auth interceptor")
        console.log(error)
          let data = {};
          data = {
              reason: error.message,
              status: error.status,
              serverError: error.error.message
          };
          this.errorDialogService.openDialog(data);
          return throwError(error);
      
    }));
  }
}