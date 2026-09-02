import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllBooks(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.baseUrl}/books`, { params });
  }

  searchBooks(query: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.baseUrl}/books/search?search=${encodeURIComponent(query)}`);
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/books/${id}`);
  }

  getCoverUrl(id: string): string {
    return `${this.baseUrl}/books/${id}/cover`;
  }

  addBook(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/books`, formData);
  }

  updateBook(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/books/${id}`, formData);
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/books/${id}`);
  }
}