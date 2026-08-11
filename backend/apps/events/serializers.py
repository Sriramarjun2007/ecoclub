
from django.utils import timezone

from rest_framework import serializers

from .models import (
    Certificate,
    Event,
    EventParticipant,
    EventRegistration,
)


# ============================================================
# EVENT
# ============================================================

class EventListSerializer(serializers.ModelSerializer):

    registration_status = serializers.SerializerMethodField()
    registrations_count = serializers.SerializerMethodField()

    # SDGs are returned by the API but are not edited through
    # this serializer.
    sdg_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
        source="sdgs",
    )

    class Meta:
        model = Event

        fields = (
            "id",
            "title",
            "slug",
            "description",
            "banner",
            "date",
            "start_time",
            "end_time",
            "venue",
            "organizer",
            "coordinator",
            "max_participants",
            "category",
            "registration_status",
            "registrations_count",
            "sdg_ids",
            "impact_text",
            "is_past",
        )

        read_only_fields = (
            "id",
            "slug",
            "registration_status",
            "registrations_count",
            "sdg_ids",
            "is_past",
        )

    def get_registration_status(self, obj):
        return obj.registration_status

    def get_registrations_count(self, obj):
        return obj.registrations.filter(
            status__in=["confirmed", "waitlist"]
        ).count()

    def create(self, validated_data):
        """
        Create event and automatically generate slug.
        """

        event = Event.objects.create(
            **validated_data
        )

        if not event.slug:
            from django.utils.text import slugify

            event.slug = (
                slugify(event.title)
                or f"event-{event.pk}"
            )

            event.save(
                update_fields=["slug"]
            )

        return event


# ============================================================
# EVENT DETAIL
# ============================================================

class EventDetailSerializer(EventListSerializer):

    agenda = serializers.CharField(
        read_only=True
    )

    rules = serializers.CharField(
        read_only=True
    )

    class Meta(EventListSerializer.Meta):

        fields = EventListSerializer.Meta.fields + (
            "agenda",
            "rules",
            "registration_deadline",
            "created_at",
        )

        read_only_fields = (
            *EventListSerializer.Meta.read_only_fields,
            "agenda",
            "rules",
            "registration_deadline",
            "created_at",
        )


# ============================================================
# EVENT REGISTRATION
# ============================================================

class EventRegistrationSerializer(
    serializers.ModelSerializer
):

    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    class Meta:
        model = EventRegistration

        fields = (
            "id",
            "event",
            "event_title",
            "full_name",
            "register_number",
            "department",
            "year",
            "email",
            "phone",
            "gender",
            "college",
            "message",
            "registration_id",
            "status",
            "created_at",
        )

        read_only_fields = (
            "id",
            "event_title",
            "registration_id",
            "status",
            "created_at",
        )

    def validate(self, attrs):

        event = (
            attrs.get("event")
            or getattr(
                self.instance,
                "event",
                None,
            )
        )

        if not event:
            raise serializers.ValidationError({
                "event": "Event is required."
            })

        if event.is_past:
            raise serializers.ValidationError({
                "event": "This event has already ended."
            })

        register_number = attrs.get(
            "register_number"
        )

        if (
            register_number
            and event.registrations.filter(
                register_number=register_number,
                status__in=[
                    "confirmed",
                    "waitlist",
                ],
            ).exists()
        ):
            raise serializers.ValidationError({
                "register_number": (
                    "You have already registered "
                    "for this event."
                )
            })

        if (
            event.registration_deadline
            and event.registration_deadline
            < timezone.localdate()
        ):
            raise serializers.ValidationError({
                "event": (
                    "Registration for this event "
                    "has closed."
                )
            })

        return attrs


# ============================================================
# EVENT PARTICIPANT
# ============================================================

class EventParticipantSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = EventParticipant

        fields = (
            "id",
            "event",
            "full_name",
            "register_number",
            "attended_on",
            "points_awarded",
            "has_certificate",
        )

        read_only_fields = (
            "id",
        )


# ============================================================
# CERTIFICATE
# ============================================================

class CertificateSerializer(
    serializers.ModelSerializer
):

    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    class Meta:
        model = Certificate

        fields = (
            "id",
            "certificate_id",
            "verification_code",
            "event",
            "event_title",
            "student",
            "full_name",
            "register_number",
            "issued_on",
            "is_verified",
        )

        read_only_fields = (
            "id",
            "certificate_id",
            "verification_code",
            "event_title",
            "issued_on",
        )

