import json

from rest_framework import permissions, viewsets, views
from rest_framework.response import Response

from .models import (Announcement, BlogPost, ContactMessage, GalleryCategory,
                     GalleryImage, ImpactStatistic, Memory, SDG, TeamMember,
                     UploadedFile, WebsiteSetting)
from .serializers import (AnnouncementSerializer, BlogPostSerializer,
                          ContactMessageSerializer, GalleryCategorySerializer,
                          GalleryImageSerializer, ImpactStatisticSerializer,
                          MemorySerializer, SDGSerializer, TeamMemberSerializer,
                          UploadedFileSerializer, WebsiteSettingSerializer)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (request.user and request.user.is_authenticated and
                (request.user.is_staff or request.user.is_staff_member()))


class SDGViewSet(viewsets.ModelViewSet):
    queryset = SDG.objects.all().prefetch_related("activities")
    serializer_class = SDGSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["number"]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("featured"):
            qs = qs.filter(is_featured=True)
        return qs


class GalleryCategoryViewSet(viewsets.ModelViewSet):
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["category", "event"]
    search_fields = ["title", "caption"]


class MemoryViewSet(viewsets.ModelViewSet):
    queryset = Memory.objects.all()
    serializer_class = MemorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["is_highlight"]


class TeamViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["role"]
    search_fields = ["name", "department", "position"]


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["category", "is_active"]
    search_fields = ["title", "body"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if not (u and u.is_authenticated and (u.is_staff or u.is_staff_member())):
            qs = qs.filter(is_active=True)
        return qs


class BlogViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["category", "is_published"]
    search_fields = ["title", "content", "tags"]
    lookup_field = "slug"

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if not (u and u.is_authenticated and (u.is_staff or u.is_staff_member())):
            qs = qs.filter(is_published=True)
        return qs

    def perform_create(self, serializer):
        post = serializer.save()
        if not post.slug:
            from django.utils.text import slugify
            post.slug = slugify(post.title) or f"post-{post.pk}"
            post.save(update_fields=["slug"])


class ContactCreateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Message posted. We will get back to you soon."},
                        status=201)


class ContactAdminViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ["is_read"]


class ImpactView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        stats = dict(ImpactStatistic.objects.values_list("metric", "value"))
        base = {m: 0 for m in ("trees", "waste", "water", "volunteers",
                               "students", "campaigns", "events", "members")}
        base.update(stats)
        return Response(base)


class ImpactAdminViewSet(viewsets.ModelViewSet):
    queryset = ImpactStatistic.objects.all()
    serializer_class = ImpactStatisticSerializer
    permission_classes = [permissions.IsAdminUser]


class SettingsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(dict(WebsiteSetting.objects.values_list("key", "value")))


class SettingsAdminViewSet(viewsets.ModelViewSet):
    queryset = WebsiteSetting.objects.all()
    serializer_class = WebsiteSettingSerializer
    permission_classes = [permissions.IsAdminUser]


class UploadViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAdminUser]
