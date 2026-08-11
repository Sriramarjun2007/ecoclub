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

router = DefaultRouter()


# ============================================================
# PUBLIC EVENT REGISTRATION
# ============================================================

urlpatterns = [

    path(
        "events/<slug:slug>/register/",
        EventRegisterView.as_view(),
        name="event-register",
    ),

    # ========================================================
    # CERTIFICATE PRINT
    # ========================================================

    path(
        "certificates/<int:pk>/print/",
        CertificatePrintView.as_view(),
        name="certificate-print",
    ),

    # ========================================================
    # ROUTER APIs
    # ========================================================

    path(
        "",
        include(router.urls),
    ),
]


# ============================================================
# ROUTER REGISTRATIONS
# ============================================================

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