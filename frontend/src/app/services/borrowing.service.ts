import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Borrowing } from '../models/borrowing';

export interface MyBooksResponse {
  msg: string;
  borrowings: Borrowing[];
}

export interface BorrowResponse {
  msg: string;
  borrowing: Borrowing;
}

@Injectable({
  providedIn: 'root',
})
export class BorrowingService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5000/borrowing';

  borrowBook(bookId: string): Observable<BorrowResponse> {
    return this.http.post<BorrowResponse>(`${this.apiUrl}/borrow`, { bookId });
  }

  returnBook(borrowingId: string): Observable<BorrowResponse> {
    return this.http.post<BorrowResponse>(`${this.apiUrl}/return/${borrowingId}`, {});
  }

  getMyBooks(): Observable<MyBooksResponse> {
    return this.http.get<MyBooksResponse>(`${this.apiUrl}/my-books`);
  }
}
