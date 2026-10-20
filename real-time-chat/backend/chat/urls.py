from django.urls import path
from .views import history

urlpatterns = [path("<str:room>/messages/", history)]
