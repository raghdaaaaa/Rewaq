import { InjectionToken } from '@angular/core';

/** Same-origin API prefix. Angular's development proxy forwards it to port 5000. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => '/api'
});
