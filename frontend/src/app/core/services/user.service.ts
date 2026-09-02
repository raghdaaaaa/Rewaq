import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { ApiUser, LibraryUser, UserRole } from '../../models/user.model';

export interface CreateUserRequest { name: string; email: string; phone?: string; password: string; role: UserRole; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly usersState = signal<LibraryUser[]>([]);
  readonly users = this.usersState.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ApiUser[]>(`${this.apiBaseUrl}/users`).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (users) => this.usersState.set(users.map((user) => this.mapUser(user))),
      error: (error: unknown) => this.error.set(this.errorMessage(error))
    });
  }

  createUser(user: CreateUserRequest): Observable<unknown> {
    return this.mutate(this.http.post<unknown>(`${this.apiBaseUrl}/users`, user));
  }

  updateRole(id: string, role: UserRole): Observable<ApiUser> {
    return this.mutate(this.http.patch<ApiUser>(`${this.apiBaseUrl}/users/${id}`, { role }));
  }

  deleteUser(id: string): Observable<unknown> {
    return this.mutate(this.http.delete<unknown>(`${this.apiBaseUrl}/users/${id}`));
  }

  private mutate<T>(request: Observable<T>): Observable<T> {
    this.error.set(null);
    return request.pipe(
      tap(() => this.loadUsers()),
      catchError((error: unknown) => {
        this.error.set(this.errorMessage(error));
        return throwError(() => error);
      })
    );
  }

  private mapUser(user: ApiUser): LibraryUser {
    const avatar = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar };
  }

  private errorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: { msg?: string } }).error;
      if (body?.msg) return body.msg;
    }
    return 'Unable to load users from the server.';
  }
}
