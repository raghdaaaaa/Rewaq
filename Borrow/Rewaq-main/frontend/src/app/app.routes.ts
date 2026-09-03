import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './features/guards/auth-guard';
import { adminGuard } from './features/guards/admin-guard';
import { guestGuard } from './features/guards/guest-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'browse',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'my-borrowings',
    component: DashboardComponent,
    canActivate: [authGuard],
  },

  {
    path: 'admin',
    redirectTo: 'admin/inventory',
    pathMatch: 'full',
  },
  {
    path: 'admin/inventory',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/users',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
