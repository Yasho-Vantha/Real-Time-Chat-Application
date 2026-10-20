import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { API, AuthService, WS } from '../auth.service';

interface Msg { id: number; user: string; text: string; created: string; }

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
  <div class="wrap">
    <header>
      <div><strong>#{{ room }}</strong> <span class="state" [class.on]="online">{{ online ? 'Connected' : 'Reconnecting…' }}</span></div>
      <div>{{ me }} <button (click)="logout()">Log out</button></div>
    </header>
    <div class="msgs" #box>
      @for (m of messages; track m.id) {
        <div class="m" [class.mine]="m.user === me">
          <small>{{ m.user === me ? 'You' : m.user }} · {{ m.created | date:'shortTime' }}</small>
          <p>{{ m.text }}</p>
        </div>
      } @empty { <p class="empty">No messages yet. Say hello.</p> }
    </div>
    <form (ngSubmit)="send()">
      <input name="t" [(ngModel)]="text" placeholder="Type a message" autocomplete="off">
      <button [disabled]="!online">Send</button>
    </form>
  </div>`,
  styles: [`
    .wrap{max-width:640px;margin:0 auto;height:100dvh;display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line)}
    header{display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line)}
    .state{color:var(--mute);font-size:.85rem;margin-left:8px}.state.on{color:var(--brand)}
    header button{margin-left:8px;border:1px solid var(--line);background:none;color:var(--ink);border-radius:6px;padding:4px 10px;cursor:pointer}
    .msgs{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:var(--bg)}
    .m{max-width:78%;align-self:flex-start;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 12px}
    .m.mine{align-self:flex-end;background:var(--mine)}.m p{margin:2px 0 0;overflow-wrap:anywhere}
    small{color:var(--mute)}.empty{color:var(--mute);text-align:center}
    form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}
    form input{flex:1;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}
    form button{padding:0 20px;border:0;border-radius:10px;background:var(--brand);color:var(--on);font-weight:700;cursor:pointer}
    form button:disabled{opacity:.5}`],
})
export class ChatComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  @ViewChild('box') box!: ElementRef<HTMLElement>;

  room = 'general';
  me = this.auth.username;
  messages: Msg[] = [];
  text = '';
  online = false;
  private ws?: WebSocket;
  private closed = false;

  ngOnInit() {
    const headers = new HttpHeaders({ Authorization: `Token ${this.auth.token}` });
    this.http.get<Msg[]>(`${API}/chat/${this.room}/messages/`, { headers }).subscribe({
      next: (h) => { this.messages = h; this.scroll(); this.connect(); },
      error: () => this.logout(),
    });
  }

  private connect() {
    this.ws = new WebSocket(`${WS}/chat/${this.room}/?token=${this.auth.token}`);
    this.ws.onopen = () => (this.online = true);
    this.ws.onmessage = (e) => { this.messages.push(JSON.parse(e.data)); this.scroll(); };
    this.ws.onclose = (e) => {
      this.online = false;
      if (e.code === 4401) return this.logout();
      if (!this.closed) setTimeout(() => this.connect(), 2000);
    };
  }

  send() {
    const t = this.text.trim();
    if (!t || !this.online) return;
    this.ws?.send(JSON.stringify({ text: t }));
    this.text = '';
  }

  private scroll() { setTimeout(() => { const el = this.box?.nativeElement; if (el) el.scrollTop = el.scrollHeight; }); }

  logout() { this.auth.logout(); this.router.navigate(['/login']); }
  ngOnDestroy() { this.closed = true; this.ws?.close(); }
}
