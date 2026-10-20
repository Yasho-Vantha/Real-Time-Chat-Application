import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
  <form class="box" (ngSubmit)="submit()">
    <h1>{{ register ? 'Create account' : 'Log in' }}</h1>
    <label>Username <input name="u" [(ngModel)]="username" required autocomplete="username"></label>
    <label>Password <input name="p" type="password" [(ngModel)]="password" required autocomplete="current-password"></label>
    <p class="err" role="alert">{{ error }}</p>
    <button class="go">{{ register ? 'Sign up and chat' : 'Log in' }}</button>
    <button type="button" class="link" (click)="register = !register">
      {{ register ? 'I already have an account' : 'New here? Create an account' }}
    </button>
  </form>`,
  styles: [`
    .box{max-width:380px;margin:12vh auto;padding:28px;background:var(--card);border:1px solid var(--line);border-radius:14px;display:grid;gap:12px}
    h1{margin:0 0 4px}label{display:grid;gap:4px;font-weight:600}
    input{padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)}
    .go{padding:12px;border:0;border-radius:8px;background:var(--brand);color:var(--on);font-weight:700;cursor:pointer}
    .link{background:none;border:0;color:var(--brand);cursor:pointer}.err{color:#c8372d;min-height:1.4em;margin:0}`],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = ''; password = ''; register = false; error = '';

  submit() {
    this.auth.auth(this.register ? 'register' : 'login', this.username, this.password).subscribe({
      next: () => this.router.navigate(['/chat']),
      error: (e) => (this.error = e.error?.error ?? 'Could not reach the server.'),
    });
  }
}
