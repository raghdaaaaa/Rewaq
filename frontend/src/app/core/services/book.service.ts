import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiBook, Book } from '../../models/book.model';

export interface CreateBookRequest { title: string; author: string; pages?: number; available: boolean; }

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly booksState = signal<Book[]>([]);
  readonly books = this.booksState.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private readonly objectUrls = new Set<string>();

  loadBooks(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ApiBook[]>(`${this.apiBaseUrl}/books`).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (books) => {
        this.clearCoverUrls();
        const mappedBooks = books.map((book) => this.mapBook(book));
        this.booksState.set(mappedBooks);
        mappedBooks.filter((book) => book.hasCover).forEach((book) => this.loadCover(book.id));
      },
      error: (error: unknown) => this.error.set(this.errorMessage(error))
    });
  }

  createBook(book: CreateBookRequest): Observable<unknown> {
    return this.mutate(this.http.post<unknown>(`${this.apiBaseUrl}/books`, book));
  }

  updateAvailability(id: string, available: boolean): Observable<ApiBook> {
    return this.mutate(this.http.patch<ApiBook>(`${this.apiBaseUrl}/books/${id}`, { available }));
  }

  deleteBook(id: string): Observable<unknown> {
    return this.mutate(this.http.delete<unknown>(`${this.apiBaseUrl}/books/${id}`));
  }

  private mutate<T>(request: Observable<T>): Observable<T> {
    this.error.set(null);
    return request.pipe(
      tap(() => this.loadBooks()),
      catchError((error: unknown) => {
        this.error.set(this.errorMessage(error));
        return throwError(() => error);
      })
    );
  }

  private mapBook(book: ApiBook): Book {
    return { id: book._id, title: book.title, author: book.author, pages: book.pages, available: book.available, hasCover: Boolean(book.coverImage?.data) };
  }

  private loadCover(id: string): void {
    this.http.get(`${this.apiBaseUrl}/books/${id}/cover`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const coverUrl = URL.createObjectURL(blob);
        this.objectUrls.add(coverUrl);
        this.booksState.update((books) => books.map((book) => book.id === id ? { ...book, coverUrl } : book));
      }
    });
  }

  private clearCoverUrls(): void {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls.clear();
  }

  private errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { msg?: string } }).error;
      if (body?.msg) return body.msg;
    }
    return 'Unable to load books from the server.';
  }
}
