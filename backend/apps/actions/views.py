
from django.utils.text import slugify

from rest_framework import permissions, viewsets, views, status
from rest_framework.response import Response

from .models import (
    Announcement,
    BlogPost,
    ContactMessage,
    GalleryCategory,
    GalleryImage,
    ImpactStatistic,
    Memory,
    SDG,
    TeamMember,
    UploadedFile,
    WebsiteSetting,
)

from .serializers import (
    AnnouncementSerializer,
    BlogPostSerializer,
    ContactMessageSerializer,
    GalleryCategorySerializer,
    GalleryImageSerializer,
    ImpactStatisticSerializer,
    MemorySerializer,
    SDGSerializer,
    TeamMemberSerializer,
    UploadedFileSerializer,
    WebsiteSettingSerializer,
)

from apps.accounts.permissions import IsClubAdmin


# ============================================================
# ADMIN OR READ ONLY
# ============================================================

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Public users can GET/HEAD/OPTIONS.

    Only Eco Club admins can:
    - POST
    - PUT
    - PATCH
    - DELETE
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):

        if request.method in permissions.SAFE_METHODS:
            return True

        return IsClubAdmin().has_permission(
            request,
            view,
        )


# ============================================================
# SDG
# ============================================================

class SDGViewSet(viewsets.ModelViewSet):

    queryset = SDG.objects.all().prefetch_related(
        "activities"
    )

    serializer_class = SDGSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    filterset_fields = [
        "number",
    ]

    def get_queryset(self):

        qs = super().get_queryset()

        if self.request.query_params.get("featured"):
            qs = qs.filter(
                is_featured=True
            )

        return qs


# ============================================================
# GALLERY CATEGORY
# ============================================================

class GalleryCategoryViewSet(viewsets.ModelViewSet):

    queryset = GalleryCategory.objects.all()

    serializer_class = GalleryCategorySerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]


# ============================================================
# GALLERY IMAGE
# ============================================================

class GalleryImageViewSet(viewsets.ModelViewSet):

    queryset = GalleryImage.objects.all()

    serializer_class = GalleryImageSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    filterset_fields = [
        "category",
        "event",
    ]

    search_fields = [
        "title",
        "caption",
    ]


# ============================================================
# MEMORY
# ============================================================

class MemoryViewSet(viewsets.ModelViewSet):

    queryset = Memory.objects.all()

    serializer_class = MemorySerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    filterset_fields = [
        "is_highlight",
    ]


# ============================================================
# TEAM
# ============================================================

class TeamViewSet(viewsets.ModelViewSet):

    queryset = TeamMember.objects.all()

    serializer_class = TeamMemberSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    filterset_fields = [
        "role",
    ]

    search_fields = [
        "name",
        "department",
        "position",
    ]


# ============================================================
# ANNOUNCEMENTS
# ============================================================

class AnnouncementViewSet(viewsets.ModelViewSet):

    queryset = Announcement.objects.all()

    serializer_class = AnnouncementSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    filterset_fields = [
        "category",
        "is_active",
    ]

    search_fields = [
        "title",
        "body",
    ]

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        is_admin = (
            user
            and user.is_authenticated
            and IsClubAdmin().has_permission(
                self.request,
                self,
            )
        )

        if not is_admin:
            qs = qs.filter(
                is_active=True
            )

        return qs


# ============================================================
# BLOG
# ============================================================

class BlogViewSet(viewsets.ModelViewSet):

    queryset = BlogPost.objects.all()

    serializer_class = BlogPostSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    filterset_fields = [
        "category",
        "is_published",
    ]

    search_fields = [
        "title",
        "content",
        "tags",
    ]

    lookup_field = "slug"

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        is_admin = (
            user
            and user.is_authenticated
            and IsClubAdmin().has_permission(
                self.request,
                self,
            )
        )

        if not is_admin:
            qs = qs.filter(
                is_published=True
            )

        return qs

    def perform_create(self, serializer):

        post = serializer.save()

        if not post.slug:

            post.slug = (
                slugify(post.title)
                or f"post-{post.pk}"
            )

            post.save(
                update_fields=[
                    "slug"
                ]
            )


# ============================================================
# CONTACT CREATE
# ============================================================

class ContactCreateView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request):

        serializer = ContactMessageSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "detail": (
                    "Message posted. "
                    "We will get back to you soon."
                )
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# CONTACT ADMIN
# ============================================================

class ContactAdminViewSet(
    viewsets.ReadOnlyModelViewSet
):

    queryset = ContactMessage.objects.all()

    serializer_class = ContactMessageSerializer

    # IMPORTANT:
    # Do NOT use permissions.IsAdminUser here.
    permission_classes = [
        IsClubAdmin
    ]

    filterset_fields = [
        "is_read",
    ]


# ============================================================
# IMPACT
# ============================================================

class ImpactView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        stats = dict(
            ImpactStatistic.objects.values_list(
                "metric",
                "value",
            )
        )

        base = {
            "trees": 0,
            "waste": 0,
            "water": 0,
            "volunteers": 0,
            "students": 0,
            "campaigns": 0,
            "events": 0,
            "members": 0,
        }

        base.update(stats)

        return Response(base)


# ============================================================
# IMPACT ADMIN
# ============================================================

class ImpactAdminViewSet(
    viewsets.ModelViewSet
):

    queryset = ImpactStatistic.objects.all()

    serializer_class = ImpactStatisticSerializer

    permission_classes = [
        IsClubAdmin
    ]


# ============================================================
# WEBSITE SETTINGS
# ============================================================

class SettingsView(views.APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request):

        return Response(
            dict(
                WebsiteSetting.objects.values_list(
                    "key",
                    "value",
                )
            )
        )


# ============================================================
# WEBSITE SETTINGS ADMIN
# ============================================================

class SettingsAdminViewSet(
    viewsets.ModelViewSet
):

    queryset = WebsiteSetting.objects.all()

    serializer_class = WebsiteSettingSerializer

    permission_classes = [
        IsClubAdmin
    ]


# ============================================================
# UPLOAD
# ============================================================

class UploadViewSet(
    viewsets.ModelViewSet
):

    queryset = UploadedFile.objects.all()

    serializer_class = UploadedFileSerializer

    permission_classes = [
        IsClubAdmin
    ]

