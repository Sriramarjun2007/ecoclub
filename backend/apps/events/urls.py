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
# EVENT REGISTRATIONS
# ============================================================

router.register(
    r"registrations",
    RegistrationViewSet,
    basename="registration",
)

# ============================================================
# EVENT PARTICIPANTS
# ============================================================

router.register(
    r"participants",
    ParticipantViewSet,
    basename="participant",
)

# ============================================================
# CERTIFICATES
# ============================================================

router.register(
    r"certificates",
    CertificateViewSet,
    basename="certificate",
)

# ============================================================
# EVENTS
# ============================================================

router.register(
    r"",
    EventViewSet,
    basename="event",
)

urlpatterns = [
    # ========================================================
    # PUBLIC EVENT REGISTRATION
    # GET/POST /api/events/<slug>/register/
    # ========================================================

    path(
        "<slug:slug>/register/",
        EventRegisterView.as_view(),
        name="event-register",
    ),

    # ========================================================
    # CERTIFICATE PRINT
    # GET /api/events/certificates/<pk>/print/
    # ========================================================

    path(
        "certificates/<int:pk>/print/",
        CertificatePrintView.as_view(),
        name="certificate-print",
    ),

    # ========================================================
    # ROUTER
    # ========================================================

    path(
        "",
        include(router.urls),
    ),
]