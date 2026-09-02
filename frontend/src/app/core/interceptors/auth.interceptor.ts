import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { AuthService } from '../services/auth.service';

/** The existing Express middleware reads the raw JWT from the custom `auth` header. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const token = inject(AuthService).token;
  if (!token || !request.url.startsWith(apiBaseUrl)) return next(request);
  return next(request.clone({ setHeaders: { auth: token } }));
};
