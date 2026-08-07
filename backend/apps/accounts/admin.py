from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import EcoPoint, Membership, Notification, StudentProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "get_full_name", "role", "is_approved", "is_active")
    list_filter = ("role", "is_approved", "is_active")
    fieldsets = BaseUserAdmin.fieldsets + (("ECO CLUB", {"fields": ("role", "is_approved", "phone")}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (("ECO CLUB", {"fields": ("role",)}),)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "register_number", "department", "year", "college")
    search_fields = ("user__username", "user__email", "register_number", "department")
    list_filter = ("year", "department")


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("membership_id", "profile", "status", "joined_on", "eco_points")
    list_filter = ("status",)
    search_fields = ("membership_id", "profile__register_number")


@admin.register(EcoPoint)
class EcoPointAdmin(admin.ModelAdmin):
    list_display = ("member", "points", "reason", "awarded_at")
    list_filter = ("reason",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "is_read", "created_at")
    list_filter = ("is_read",)
