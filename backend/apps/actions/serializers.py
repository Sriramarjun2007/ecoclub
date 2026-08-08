from rest_framework import serializers

from .models import (
    Announcement,
    BlogPost,
    ContactMessage,
    GalleryCategory,
    GalleryImage,
    ImpactStatistic,
    Memory,
    SDG,
    SDGActivity,
    TeamMember,
    UploadedFile,
    WebsiteSetting,
)


class SDGActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SDGActivity
        fields = (
            "id",
            "title",
            "description",
            "sort_order",
        )


class SDGSerializer(serializers.ModelSerializer):
    activities = SDGActivitySerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = SDG
        fields = (
            "id",
            "number",
            "name",
            "short_name",
            "description",
            "contribution",
            "icon",
            "color",
            "is_featured",
            "sort_order",
            "activities",
        )


class GalleryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryCategory
        fields = [
            "id",
            "name",
            "slug",
        ]


class GalleryImageSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = GalleryImage
        fields = [
            "id",
            "title",
            "caption",
            "image",
            "category",
            "category_name",
            "event",
            "uploaded_at",
        ]


class MemorySerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    class Meta:
        model = Memory
        fields = [
            "id",
            "title",
            "description",
            "photo",
            "year",
            "date",
            "event",
            "event_title",
            "participants",
            "is_highlight",
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = [
            "id",
            "role",
            "name",
            "position",
            "designation",
            "department",
            "year",
            "email",
            "photo",
            "sort_order",
        ]


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "body",
            "category",
            "is_pinned",
            "is_active",
            "created_at",
        ]


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "cover_image",
            "author",
            "content",
            "excerpt",
            "category",
            "tags",
            "is_published",
            "created_at",
        ]


# ============================================================
# CONTACT MESSAGE
# ============================================================

class ContactMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "message",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "is_read",
            "created_at",
        ]


class ImpactStatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactStatistic
        fields = [
            "id",
            "metric",
            "value",
            "unit",
            "icon",
        ]


class WebsiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSetting
        fields = [
            "id",
            "key",
            "value",
            "label",
        ]


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "purpose",
            "name",
            "file",
            "uploaded_at",
        ]