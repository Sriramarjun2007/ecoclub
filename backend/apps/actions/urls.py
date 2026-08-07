from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (AnnouncementViewSet, BlogViewSet, ContactAdminViewSet,
                    ContactCreateView, GalleryCategoryViewSet, GalleryImageViewSet,
                    ImpactAdminViewSet, ImpactView, MemoryViewSet, SDGViewSet,
                    SettingsAdminViewSet, SettingsView, TeamViewSet, UploadViewSet)

app_name = "actions"

router = DefaultRouter()
router.register(r"sdgs", SDGViewSet, basename="sdg")
router.register(r"gallery/categories", GalleryCategoryViewSet, basename="gallery-category")
router.register(r"gallery", GalleryImageViewSet, basename="gallery")
router.register(r"memories", MemoryViewSet, basename="memory")
router.register(r"team", TeamViewSet, basename="team")
router.register(r"announcements", AnnouncementViewSet, basename="announcement")
router.register(r"blog", BlogViewSet, basename="blog")
router.register(r"contact/admin", ContactAdminViewSet, basename="contact-admin")
router.register(r"impact/admin", ImpactAdminViewSet, basename="impact-admin")
router.register(r"settings/admin", SettingsAdminViewSet, basename="settings-admin")
router.register(r"uploads", UploadViewSet, basename="upload")

urlpatterns = [
    path("", include(router.urls)),
    path("contact/", ContactCreateView.as_view(), name="contact-create"),
    path("impact/", ImpactView.as_view(), name="impact"),
    path("settings/", SettingsView.as_view(), name="settings"),
]
