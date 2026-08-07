from django.contrib import admin

from .models import (Announcement, BlogPost, ContactMessage, GalleryCategory,
                      GalleryImage, ImpactStatistic, Memory, SDG, SDGActivity,
                      TeamMember, WebsiteSetting)



class SDGActivityInline(admin.TabularInline):
    model = SDGActivity
    extra = 1


@admin.register(SDG)
class SDGAdmin(admin.ModelAdmin):
    inlines = [SDGActivityInline]


@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "event", "uploaded_at")
    list_filter = ("category",)


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ("title", "year", "participants", "is_highlight")


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "position", "department")


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_pinned", "is_active", "created_at")
    list_filter = ("category", "is_active")


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "author", "is_published", "created_at")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "is_read", "created_at")


@admin.register(ImpactStatistic)
class ImpactStatisticAdmin(admin.ModelAdmin):
    list_display = ("metric", "value", "unit")


@admin.register(WebsiteSetting)
class WebsiteSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "value")
