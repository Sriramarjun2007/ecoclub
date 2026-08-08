
from django.contrib import admin

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
    WebsiteSetting,
)


# ============================================================
# SDG
# ============================================================

class SDGActivityInline(admin.TabularInline):
    model = SDGActivity
    extra = 1


@admin.register(SDG)
class SDGAdmin(admin.ModelAdmin):
    inlines = [SDGActivityInline]


# ============================================================
# GALLERY CATEGORY
# ============================================================

@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {
        "slug": ("name",)
    }


# ============================================================
# GALLERY IMAGE
# ============================================================

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "event",
        "uploaded_at",
    )

    list_filter = (
        "category",
    )

    search_fields = (
        "title",
        "caption",
    )


# ============================================================
# MEMORY
# ============================================================

@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "year",
        "participants",
        "is_highlight",
    )

    list_filter = (
        "is_highlight",
        "year",
    )


# ============================================================
# TEAM
# ============================================================

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "role",
        "position",
        "department",
    )

    search_fields = (
        "name",
        "role",
        "position",
        "department",
    )


# ============================================================
# ANNOUNCEMENTS
# ============================================================

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "is_pinned",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "is_active",
        "is_pinned",
    )

    search_fields = (
        "title",
        "body",
    )


# ============================================================
# BLOG
# ============================================================

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "author",
        "is_published",
        "created_at",
    )

    list_filter = (
        "category",
        "is_published",
    )

    search_fields = (
        "title",
        "content",
        "tags",
    )

    prepopulated_fields = {
        "slug": ("title",)
    }


# ============================================================
# CONTACT MESSAGES
# ============================================================

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "email",
        "subject",
        "is_read",
        "created_at",
    )

    list_filter = (
        "is_read",
        "created_at",
    )

    search_fields = (
        "name",
        "email",
        "subject",
        "message",
    )

    ordering = (
        "-created_at",
    )


# ============================================================
# IMPACT STATISTICS
# ============================================================

@admin.register(ImpactStatistic)
class ImpactStatisticAdmin(admin.ModelAdmin):
    list_display = (
        "metric",
        "value",
        "unit",
    )


# ============================================================
# WEBSITE SETTINGS
# ============================================================

@admin.register(WebsiteSetting)
class WebsiteSettingAdmin(admin.ModelAdmin):
    list_display = (
        "key",
        "label",
        "value",
    )

    search_fields = (
        "key",
        "label",
    )
