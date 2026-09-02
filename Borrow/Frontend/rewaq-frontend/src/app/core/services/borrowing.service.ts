import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Borrowing } from '../models/borrowing.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BorrowingService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  borrowBook(bookId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/borrowing/borrow`, { bookId });
  }

  returnBook(borrowingId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/borrowing/return/${borrowingId}`, {});
  }

  getMyActiveBooks(): Observable<{ msg: string; borrowings: Borrowing[] }> {
    return this.http.get<{ msg: string; borrowings: Borrowing[] }>(`${this.baseUrl}/borrowing/my-books`)
      .pipe(
        catchError(err => {
          if (err.status === 404 && err.error?.error_message === 'No borrowings found') {
            return throwError(() => ({ empty: true, msg: 'No active borrowings' }));
          }
          return throwError(() => err);
        })
      );
  }

  getMyHistory(): Observable<{ msg: string; borrowings: Borrowing[] }> {
    return this.http.get<{ msg: string; borrowings: Borrowing[] }>(`${this.baseUrl}/borrowing/history`);
  }
}
