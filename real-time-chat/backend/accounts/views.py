from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


def token_response(user, status=200):
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username}, status=status)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        if len(username) < 3 or len(password) < 6:
            return Response({"error": "Username needs 3+ characters and password 6+."}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"error": "That username is taken."}, status=400)
        return token_response(User.objects.create_user(username=username, password=password), 201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
        if not user:
            return Response({"error": "Wrong username or password."}, status=400)
        return token_response(user)
