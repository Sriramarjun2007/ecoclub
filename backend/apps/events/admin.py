from django.contrib import admin

from .models import Certificate, Event, EventParticipant, EventRegistration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "venue", "category", "max_participants", "is_past")
    list_filter = ("category", "is_past", "is_published")
    search_fields = ("title", "venue", "organizer")
    filter_horizontal = ("sdgs",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("registration_id", "full_name", "event", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("full_name", "register_number", "email")


@admin.register(EventParticipant)
class EventParticipantAdmin(admin.ModelAdmin):
    list_display = ("full_name", "event", "attended_on", "points_awarded", "has_certificate")


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_id", "full_name", "event", "issued_on", "is_verified")
    search_fields = ("certificate_id", "verification_code", "full_name")
