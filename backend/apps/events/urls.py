from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CertificatePrintView,
    CertificateViewSet,
    EventViewSet,
    ParticipantViewSet,
    RegistrationViewSet,
)

app_name = "events"

router = DefaultRouter()

router.register(
    r"events",
    EventViewSet,
    basename="event",
)

router.register(
    r"registrations",
    RegistrationViewSet,
    basename="registration",
)

router.register(
    r"participants",
    ParticipantViewSet,
    basename="participant",
)

router.register(
    r"certificates",
    CertificateViewSet,
    basename="certificate",
)

urlpatterns = [
    path(
        "",
        include(router.urls),
    ),

    path(
        "certificates/<int:pk>/print/",
        CertificatePrintView.as_view(),
        name="certificate-print",
    ),
]