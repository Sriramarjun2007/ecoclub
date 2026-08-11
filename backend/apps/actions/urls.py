from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    OverviewView,
    SDGViewSet,
    GalleryCategoryViewSet,
    GalleryImageViewSet,
    MemoryViewSet,
    TeamViewSet,
    AnnouncementViewSet,
    BlogViewSet,
    ContactCreateView,
    ContactAdminViewSet,
    ImpactView,
    ImpactAdminViewSet,
    SettingsView,
    SettingsAdminViewSet,
    UploadViewSet,
)

app_name = "actions"


# ============================================================
# ROUTER
# ============================================================

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
    r"gallery/images",
    GalleryImageViewSet,
    basename="gallery-image",
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
    r"contacts",
    ContactAdminViewSet,
    basename="contact-admin",
)


# ============================================================
# IMPACT ADMIN
# ============================================================

router.register(
    r"impact-admin",
    ImpactAdminViewSet,
    basename="impact-admin",
)


# ============================================================
# SETTINGS ADMIN
# ============================================================

router.register(
    r"settings-admin",
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

    # --------------------------------------------------------
    # ADMIN OVERVIEW
    # GET /api/overview/
    # --------------------------------------------------------

    path(
        "overview/",
        OverviewView.as_view(),
        name="overview",
    ),

    # --------------------------------------------------------
    # PUBLIC IMPACT
    # GET /api/impact/
    # --------------------------------------------------------

    path(
        "impact/",
        ImpactView.as_view(),
        name="impact",
    ),

    # --------------------------------------------------------
    # PUBLIC SETTINGS
    # GET /api/settings/
    # --------------------------------------------------------

    path(
        "settings/",
        SettingsView.as_view(),
        name="settings",
    ),

    # --------------------------------------------------------
    # PUBLIC CONTACT
    # POST /api/contact/
    # --------------------------------------------------------

    path(
        "contact/",
        ContactCreateView.as_view(),
        name="contact-create",
    ),

    # --------------------------------------------------------
    # ADMIN / ROUTER API
    # --------------------------------------------------------

    path(
        "",
        include(router.urls),
    ),
]