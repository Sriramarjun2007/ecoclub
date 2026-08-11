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
    OverviewView,
    SDGViewSet,
    SettingsAdminViewSet,
    SettingsView,
    TeamViewSet,
    UploadViewSet,
)


app_name = "actions"


router = DefaultRouter()

router.register(
    r"sdgs",
    SDGViewSet,
    basename="sdg",
)

router.register(
    r"gallery-categories",
    GalleryCategoryViewSet,
    basename="gallery-category",
)

router.register(
    r"gallery",
    GalleryImageViewSet,
    basename="gallery",
)

router.register(
    r"memories",
    MemoryViewSet,
    basename="memory",
)

router.register(
    r"team",
    TeamViewSet,
    basename="team",
)

router.register(
    r"announcements",
    AnnouncementViewSet,
    basename="announcement",
)

router.register(
    r"blogs",
    BlogViewSet,
    basename="blog",
)

router.register(
    r"contacts",
    ContactAdminViewSet,
    basename="contact-admin",
)

router.register(
    r"impact-admin",
    ImpactAdminViewSet,
    basename="impact-admin",
)

router.register(
    r"settings-admin",
    SettingsAdminViewSet,
    basename="settings-admin",
)

router.register(
    r"uploads",
    UploadViewSet,
    basename="upload",
)


urlpatterns = [
    # ========================================================
    # ADMIN OVERVIEW
    # GET /api/overview/
    # ========================================================

    path(
        "overview/",
        OverviewView.as_view(),
        name="overview",
    ),

    # ========================================================
    # PUBLIC IMPACT
    # GET /api/impact/
    # ========================================================

    path(
        "impact/",
        ImpactView.as_view(),
        name="impact",
    ),

    # ========================================================
    # PUBLIC SETTINGS
    # GET /api/settings/
    # ========================================================

    path(
        "settings/",
        SettingsView.as_view(),
        name="settings",
    ),

    # ========================================================
    # CONTACT
    # POST /api/contact/
    # ========================================================

    path(
        "contact/",
        ContactCreateView.as_view(),
        name="contact",
    ),

    # ========================================================
    # ROUTER
    # ========================================================

    path(
        "",
        include(router.urls),
    ),
]