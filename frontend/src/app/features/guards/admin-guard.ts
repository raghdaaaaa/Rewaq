import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if user has administrator privileges
  if (authService.isAdmin()) {
    return true;
  }

  // Regular Patron attempting to access Admin Dashboard -> BLOCK ACCESS
  console.warn(`[adminGuard] Access denied for user "${authService.currentUser()?.email}". Admin role required.`);
  router.navigate(['/dashboard']);
  return false;
};
