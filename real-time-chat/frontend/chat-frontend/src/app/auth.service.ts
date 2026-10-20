import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export const API = 'http://localhost:8000/api';
export const WS = 'ws://localhost:8000/ws';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  get token() { return localStorage.getItem('token'); }
  get username() { return localStorage.getItem('username') ?? ''; }
  get loggedIn() { return !!this.token; }

  auth(mode: 'login' | 'register', username: string, password: string) {
    return this.http.post<{ token: string; username: string }>(`${API}/auth/${mode}/`, { username, password }).pipe(
      tap((r) => { localStorage.setItem('token', r.token); localStorage.setItem('username', r.username); })
    );
  }

  logout() { localStorage.clear(); }
}
