import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';

/** No request should ever hang the UI. Fail loudly instead. */
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

      // A request that never came back: report it as a reachable-server
      // problem rather than leaving the page spinning forever.
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

      // logs every failure with its timing, so a slow call is visible
      console.error(`[api] ${httpError.status} after ${elapsed}ms — ${req.method} ${req.url}`);

      // 401 on a protected route means the session is gone
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
