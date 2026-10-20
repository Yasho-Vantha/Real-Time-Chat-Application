# Real-Time Chat

A web app where users log in, join a chat room and exchange messages instantly over WebSockets. No page refresh needed.

## Tech stack
| Layer | Technology |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Real-time | Django Channels, WebSockets (served by Daphne) |
| Frontend | Angular (TypeScript), HTML, CSS |
| Database | SQLite (Django default) |

## How it works
1. Angular login page sends username and password to Django (`/api/auth/login/`).
2. Django checks the credentials and returns an auth token.
3. The chat page loads recent messages (`/api/chat/<room>/messages/`).
4. Angular opens a WebSocket: `ws://localhost:8000/ws/chat/<room>/?token=...`.
5. Messages go through the WebSocket, Django Channels saves them and broadcasts them to everyone in the room.

## Run it
**Backend**
```
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations chat
python manage.py migrate
python manage.py runserver
```
**Frontend** (new terminal, Node 18+)
```
cd frontend/chat-frontend
npm install
npm start
```
Open http://localhost:4200, create two accounts in two browsers (or one normal and one private window) and chat.

## Structure
```
real-time-chat/
├── backend/   manage.py  chat_project/  accounts/  chat/
└── frontend/chat-frontend/src/app/  login/  chat/
```

## Notes
- Development settings only (open CORS, debug on, in-memory channel layer). For production use `channels_redis`, a real `SECRET_KEY` and restricted CORS.

## Push to GitHub
```
git init
git add .
git commit -m "Real-time chat app"
git branch -M main
git remote add origin https://github.com/<your-username>/real-time-chat.git
git push -u origin main
```
