from django.utils.text import slugify

from rest_framework import (
    permissions,
    viewsets,
    views,
    status,
)
from rest_framework.response import Response

from apps.accounts.models import User, Membership
from apps.accounts.permissions import IsClubAdmin
from apps.events.models import Event, Registration

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


# ============================================================
# ADMIN OR READ ONLY
# ============================================================

class IsAdminOrReadOnly(permissions.BasePermission):

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):

        # Public users can GET/HEAD/OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only Eco Club admins can modify content
        return IsClubAdmin().has_permission(
            request,
            view,
        )


# ============================================================
# ADMIN OVERVIEW
# ============================================================

class OverviewView(views.APIView):

    permission_classes = [
        IsClubAdmin
    ]

    def get(self, request):

        # ----------------------------------------------------
        # TOTAL STUDENTS
        # ----------------------------------------------------
        # Shows the actual number of student users.
        # If there are no students, this returns 0.
        # ----------------------------------------------------

        students_count = User.objects.filter(
            role="student"
        ).count()

        # ----------------------------------------------------
        # APPROVED MEMBERS
        # ----------------------------------------------------

        approved_members_count = Membership.objects.filter(
            status="approved"
        ).count()

        # ----------------------------------------------------
        # PENDING MEMBERS
        # ----------------------------------------------------

        pending_members_count = Membership.objects.filter(
            status="pending"
        ).count()

        # ----------------------------------------------------
        # REJECTED MEMBERS
        # ----------------------------------------------------

        rejected_members_count = Membership.objects.filter(
            status="rejected"
        ).count()

        # ----------------------------------------------------
        # EVENTS
        # ----------------------------------------------------

        events_count = Event.objects.count()

        # ----------------------------------------------------
        # REGISTRATIONS
        # ----------------------------------------------------

        registrations_count = Registration.objects.count()

        # ----------------------------------------------------
        # IMPACT STATISTICS
        # ----------------------------------------------------

        stats = dict(
            ImpactStatistic.objects.values_list(
                "metric",
                "value",
            )
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "students": students_count,

                "events": events_count,

                "registrations": registrations_count,

                "volunteers": stats.get(
                    "volunteers",
                    0,
                ),

                "trees": stats.get(
                    "trees",
                    0,
                ),

                "waste": stats.get(
                    "waste",
                    0,
                ),

                "water": stats.get(
                    "water",
                    0,
                ),

                "campaigns": stats.get(
                    "campaigns",
                    0,
                ),

                "members": approved_members_count,

                "approved_members": approved_members_count,

                "pending_members": pending_members_count,

                "rejected_members": rejected_members_count,
            },
            status=status.HTTP_200_OK,
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

    # Anyone can send a contact message.
    permission_classes = [
        permissions.AllowAny
    ]

    # Do not require JWT authentication.
    authentication_classes = []

    def post(self, request, *args, **kwargs):

        serializer = ContactMessageSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail": "Invalid contact form data.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        contact = serializer.save()

        return Response(
            {
                "detail": (
                    "Message posted. "
                    "We will get back to you soon."
                ),
                "id": contact.id,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# CONTACT ADMIN
# ============================================================

class ContactAdminViewSet(
    viewsets.ModelViewSet
):

    queryset = ContactMessage.objects.all().order_by(
        "-created_at"
    )

    serializer_class = ContactMessageSerializer

    permission_classes = [
        IsClubAdmin
    ]

    filterset_fields = [
        "is_read",
    ]

    http_method_names = [
        "get",
        "patch",
        "head",
        "options",
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