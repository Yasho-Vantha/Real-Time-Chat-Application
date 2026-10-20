from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.authtoken.models import Token

from .models import Message


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room = self.scope["url_route"]["kwargs"]["room"]
        self.group = f"chat_{self.room}"
        token = dict(p.split("=", 1) for p in self.scope["query_string"].decode().split("&") if "=" in p).get("token")
        self.user = await self.get_user(token)
        if not self.user:
            await self.close(code=4401)  # not logged in
            return
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def receive_json(self, content):
        text = (content.get("text") or "").strip()[:1000]
        if not text:
            return
        msg = await self.save(text)
        await self.channel_layer.group_send(self.group, {
            "type": "chat.message",
            "message": {"id": msg.id, "user": self.user.username, "text": msg.text, "created": msg.created.isoformat()},
        })

    async def chat_message(self, event):  # runs for every user in the room
        await self.send_json(event["message"])

    @database_sync_to_async
    def get_user(self, key):
        try:
            return Token.objects.select_related("user").get(key=key).user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def save(self, text):
        return Message.objects.create(room=self.room, user=self.user, text=text)
