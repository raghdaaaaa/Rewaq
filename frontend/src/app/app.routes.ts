import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'books',
        pathMatch: 'full'
      },
      {
        path: 'books',
        loadComponent: () => import('./features/books/browse-books/browse-books')
          .then(m => m.BrowseBooksComponent)
      },
      {
        path: 'books/:id',
        loadComponent: () => import('./features/books/book-details/book-details')
          .then(m => m.BookDetailsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'books'
  }
];