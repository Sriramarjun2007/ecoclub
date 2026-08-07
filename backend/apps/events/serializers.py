from django.utils import timezone
from rest_framework import serializers

from .models import Certificate, Event, EventParticipant, EventRegistration


class EventListSerializer(serializers.ModelSerializer):
    registration_status = serializers.SerializerMethodField()
    registrations_count = serializers.SerializerMethodField()
    sdg_ids = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source="sdgs")

    class Meta:
        model = Event
        fields = ("id", "title", "slug", "description", "banner", "date",
                  "start_time", "end_time", "venue", "organizer", "coordinator",
                  "max_participants", "category", "registration_status",
                  "registrations_count", "sdg_ids", "impact_text", "is_past")

    def get_registration_status(self, obj):
        return obj.registration_status

    def get_registrations_count(self, obj):
        return obj.registrations.filter(status__in=["confirmed", "waitlist"]).count()


class EventDetailSerializer(EventListSerializer):
    agenda = serializers.CharField()
    rules = serializers.CharField()

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + ("agenda", "rules",
                                                    "registration_deadline", "created_at")


class EventRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = EventRegistration
        fields = ("id", "event", "event_title", "full_name", "register_number", "department",
                  "year", "email", "phone", "gender", "college", "message",
                  "registration_id", "status", "created_at")
        read_only_fields = ("registration_id", "status", "created_at")

    def validate(self, attrs):
        event = attrs.get("event") or getattr(self.instance, "event", None)
        if not event:
            raise serializers.ValidationError("Event is required.")
        rn = attrs.get("register_number")
        if event.is_past:
            raise serializers.ValidationError("This event has already ended.")
        if event.registrations.filter(register_number=rn,
                                      status__in=["confirmed", "waitlist"]).exists():
            raise serializers.ValidationError("You have already registered for this event.")
        if (event.registration_deadline and
                event.registration_deadline < timezone.localdate()):
            raise serializers.ValidationError("Registration for this event has closed.")
        return attrs


class EventParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = ("id", "event", "full_name", "register_number", "attended_on",
                  "points_awarded", "has_certificate")


class CertificateSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Certificate
        fields = ("id", "certificate_id", "verification_code", "event", "event_title",
                  "student", "full_name", "register_number", "issued_on", "is_verified")
