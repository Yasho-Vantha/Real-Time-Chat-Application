import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';

const requireLogin = () => (inject(AuthService).loggedIn ? true : inject(Router).createUrlTree(['/login']));

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent, canActivate: [requireLogin] },
  { path: '**', redirectTo: 'chat' },
];
