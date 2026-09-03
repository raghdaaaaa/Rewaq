import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';

const REQUEST_TIMEOUT_MS = 10000;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        auth: token,
      },
    });
  }

  const startedAt = performance.now();

  return next(clonedReq).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((error: unknown) => {
      const elapsed = Math.round(performance.now() - startedAt);

      if (error instanceof TimeoutError) {
        console.error(`[api] TIMEOUT after ${elapsed}ms — ${req.method} ${req.url}`);
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 0,
              statusText: 'Timeout',
              url: req.url,
              error: {
                msg: `The server did not respond within ${REQUEST_TIMEOUT_MS / 1000}s.`,
              },
            }),
        );
      }

      const httpError = error as HttpErrorResponse;

      console.error(`[api] ${httpError.status} after ${elapsed}ms — ${req.method} ${req.url}`);

      if (
        httpError.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/register')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      return throwError(() => httpError);
    }),
  );
};
