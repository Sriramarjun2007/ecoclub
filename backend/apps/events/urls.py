
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

# ============================================================
# EVENTS
# ============================================================

router.register(
    r"events",
    EventViewSet,
    basename="event",
)

# ============================================================
# REGISTRATIONS
# ============================================================

router.register(
    r"registrations",
    RegistrationViewSet,
    basename="registration",
)

# ============================================================
# PARTICIPANTS
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
# URL PATTERNS
# ============================================================

urlpatterns = [
    # Router APIs
    path(
        "",
        include(router.urls),
    ),

    # Certificate print
    path(
        "certificates/<int:pk>/print/",
        CertificatePrintView.as_view(),
        name="certificate-print",
    ),
]
