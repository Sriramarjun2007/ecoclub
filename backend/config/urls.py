"""
Root URL configuration for the ECO CLUB platform.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def home(request):
    return JsonResponse({
        "status": "success",
        "message": "ECO CLUB API is running!",
        "version": "1.0",
    })


urlpatterns = [
    path(
        "",
        home,
        name="home",
    ),

    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/",
        include("config.api_urls"),
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )