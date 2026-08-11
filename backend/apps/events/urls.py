from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CertificatePrintView,
    CertificateViewSet,
    EventRegisterView,
    EventViewSet,
    ParticipantViewSet,
    RegistrationViewSet,
)

app_name = "events"

# 1. Instantiate and populate the router FIRST
router = DefaultRouter()
router.register(r"", EventViewSet, basename="event")
router.register(r"registrations", RegistrationViewSet, basename="registration")
router.register(r"participants", ParticipantViewSet, basename="participant")
router.register(r"certificates", CertificateViewSet, basename="certificate")

# 2. Define URL patterns
urlpatterns = [
    # Custom non-router action endpoints
    path(
        "<slug:slug>/register/",
        EventRegisterView.as_view(),
        name="event-register",
    ),
    path(
        "certificates/<int:pk>/print/",
        CertificatePrintView.as_view(),
        name="certificate-print",
    ),

    # 3. Router URLs included last
    path("", include(router.urls)),
]