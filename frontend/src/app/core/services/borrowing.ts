import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Borrowing } from '../models/borrowing';

@Injectable({
  providedIn: 'root'
})
export class BorrowingService {
  private apiUrl = '/api/borrowings';

  constructor(private http: HttpClient) {}

  borrowBook(bookId: string): Observable<Borrowing> {
    return this.http.post<Borrowing>(`${this.apiUrl}/borrow`, { bookId });
  }

  returnBook(borrowingId: string): Observable<Borrowing> {
    return this.http.post<Borrowing>(`${this.apiUrl}/return`, { borrowingId });
  }

  getMyBorrowings(): Observable<Borrowing[]> {
    return this.http.get<Borrowing[]>(`${this.apiUrl}/my-borrowings`);
  }

  getAllBorrowings(): Observable<Borrowing[]> {
    return this.http.get<Borrowing[]>(this.apiUrl);
  }
}