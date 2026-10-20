from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Message


@api_view(["GET"])
def history(request, room):
    msgs = Message.objects.filter(room=room).select_related("user").order_by("-created")[:50]
    return Response([
        {"id": m.id, "user": m.user.username, "text": m.text, "created": m.created.isoformat()}
        for m in reversed(list(msgs))
    ])
