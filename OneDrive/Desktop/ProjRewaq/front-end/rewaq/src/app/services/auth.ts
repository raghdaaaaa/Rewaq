import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, AuthResponse } from '../models/user';

@Injectable({
  providedIn: 'root',
})
class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/auth'; // URL to backend auth routes

  register(userData: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }
}

export { AuthService };
