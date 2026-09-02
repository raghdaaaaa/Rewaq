import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'admin/books', loadComponent: () => import('./pages/admin-books/admin-books.component').then((m) => m.AdminBooksComponent) },
  { path: 'users', loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'admin/books' },
  { path: '**', redirectTo: 'admin/books' }
];
