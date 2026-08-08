from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnnouncementViewSet,
    BlogViewSet,
    ContactAdminViewSet,
    ContactCreateView,
    GalleryCategoryViewSet,
    GalleryImageViewSet,
    ImpactAdminViewSet,
    ImpactView,
    MemoryViewSet,
    SDGViewSet,
    SettingsAdminViewSet,
    SettingsView,
    TeamViewSet,
    UploadViewSet,
    OverviewView,
)

app_name = "actions"

router = DefaultRouter()

# ============================================================
# SDGs
# ============================================================

router.register(
    r"sdgs",
    SDGViewSet,
    basename="sdg",
)

# ============================================================
# GALLERY
# ============================================================

router.register(
    r"gallery/categories",
    GalleryCategoryViewSet,
    basename="gallery-category",
)

router.register(
    r"gallery",
    GalleryImageViewSet,
    basename="gallery",
)

# ============================================================
# MEMORIES
# ============================================================

router.register(
    r"memories",
    MemoryViewSet,
    basename="memory",
)

# ============================================================
# TEAM
# ============================================================

router.register(
    r"team",
    TeamViewSet,
    basename="team",
)

# ============================================================
# ANNOUNCEMENTS
# ============================================================

router.register(
    r"announcements",
    AnnouncementViewSet,
    basename="announcement",
)

# ============================================================
# BLOG
# ============================================================

router.register(
    r"blog",
    BlogViewSet,
    basename="blog",
)

# ============================================================
# CONTACT ADMIN
# ============================================================

router.register(
    r"contact/admin",
    ContactAdminViewSet,
    basename="contact-admin",
)

# ============================================================
# IMPACT ADMIN
# ============================================================

router.register(
    r"impact/admin",
    ImpactAdminViewSet,
    basename="impact-admin",
)

# ============================================================
# SETTINGS ADMIN
# ============================================================

router.register(
    r"settings/admin",
    SettingsAdminViewSet,
    basename="settings-admin",
)

# ============================================================
# UPLOADS
# ============================================================

router.register(
    r"uploads",
    UploadViewSet,
    basename="upload",
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

    # Dashboard overview
    path(
        "overview/",
        OverviewView.as_view(),
        name="overview",
    ),

    # Public contact form
    path(
        "contact/",
        ContactCreateView.as_view(),
        name="contact-create",
    ),

    # Public impact
    path(
        "impact/",
        ImpactView.as_view(),
        name="impact",
    ),

    # Public settings
    path(
        "settings/",
        SettingsView.as_view(),
        name="settings",
    ),
]