import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://127.0.0.1:5000/auth';

  currentUser = signal<User | null>(this.getSavedUser());

  register(userData: Partial<User>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        if (res.token) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.token) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  saveSession(token: string, user?: User): void {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
    } else {
      // Decode user from token payload if user object not provided
      const decoded = this.decodeToken(token);
      if (decoded) {
        const fallbackUser: User = {
          id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email || '',
          role: decoded.role || 'user',
        };
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        this.currentUser.set(fallbackUser);
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private getSavedUser(): User | null {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        return JSON.parse(saved);
      }
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = this.decodeToken(token);
        if (decoded) {
          return {
            id: decoded.id,
            name: decoded.name || 'User',
            email: decoded.email || '',
            role: decoded.role || 'user',
          };
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = atob(parts[1]);
        return JSON.parse(payload);
      }
    } catch {
      return null;
    }
    return null;
  }
}
