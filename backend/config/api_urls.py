"""API routing — mounts every app router under /api/."""
from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.urls")),
    path("", include("apps.events.urls")),
    path("", include("apps.actions.urls")),
]
