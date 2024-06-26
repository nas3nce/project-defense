import { Injectable, Provider } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { ErrorService } from './core/error/error.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

  constructor(private router: Router, private errorService: ErrorService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.startsWith('/api')) {
      request = request.clone({
        url: request.url.replace('/api', environment.API_URL),
        withCredentials: true
      })
    }

    return next.handle(request)
      .pipe(
        catchError(err => {
          if (err.status === 401 && err.url == 'http://localhost:3000/api/login') {
            this.errorService.setError(err)
          } else if (err.status === 401) {
            return [err]
          } else {
            this.errorService.setError(err)
            this.router.navigate(['/errorHandle'])
          }
          return [err]
        })
      )
  }
}

export const AppInterceptorProvider: Provider = {
  useClass: AppInterceptor,
  multi: true,
  provide: HTTP_INTERCEPTORS
}
