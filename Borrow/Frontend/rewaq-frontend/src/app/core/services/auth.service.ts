import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('rewaq_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('rewaq_token', res.token);
      }),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  register(name: string, email: string, password: string, phone: string, role?: string): Observable<any> {
    const body: any = { name, email, password, phone };
    if (role) body['role'] = role;
    return this.http.post<{ token: string; user: User }>(`${this.baseUrl}/auth/register`, body).pipe(
      tap(res => {
        localStorage.setItem('rewaq_token', res.token);
        localStorage.setItem('rewaq_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`).pipe(
      tap(user => {
        localStorage.setItem('rewaq_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('rewaq_token');
    localStorage.removeItem('rewaq_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('rewaq_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
}
