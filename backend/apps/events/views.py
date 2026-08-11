
from django.utils.text import slugify

from rest_framework import permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.actions.models import WebsiteSetting
from apps.accounts.services import (
    award_points,
    get_membership_for_user,
)

from .models import (
    Certificate,
    Event,
    EventParticipant,
    EventRegistration,
)

from .serializers import (
    CertificateSerializer,
    EventDetailSerializer,
    EventListSerializer,
    EventParticipantSerializer,
    EventRegistrationSerializer,
)


# ============================================================
# ADMIN OR READ ONLY
# ============================================================

class IsAdminOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):

        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user

        return (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_staff_member()
            )
        )


# ============================================================
# EVENTS
# ============================================================

class EventViewSet(viewsets.ModelViewSet):

    queryset = (
        Event.objects
        .all()
        .prefetch_related(
            "sdgs",
            "registrations",
        )
    )

    serializer_class = EventListSerializer

    permission_classes = [
        IsAdminOrReadOnly,
    ]

    # ========================================================
    # IMPORTANT
    # Frontend uses:
    #
    # /api/events/hackathon/
    #
    # So DRF must find the event by slug.
    # ========================================================

    lookup_field = "slug"

    filterset_fields = [
        "category",
        "is_past",
        "sdgs",
        "is_published",
    ]

    search_fields = [
        "title",
        "description",
        "venue",
        "organizer",
    ]

    ordering_fields = [
        "date",
    ]

    # ========================================================
    # QUERYSET
    # ========================================================

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        # Public users can only see published events
        if not (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_staff_member()
            )
        ):
            qs = qs.filter(
                is_published=True
            )

        return qs

    # ========================================================
    # SERIALIZER
    # ========================================================

    def get_serializer_class(self):

        if self.action == "retrieve":
            return EventDetailSerializer

        return EventListSerializer

    # ========================================================
    # CREATE EVENT
    # ========================================================

    def perform_create(self, serializer):

        event = serializer.save()

        # Automatically create slug
        if not event.slug:

            event.slug = (
                slugify(event.title)
                or f"event-{event.pk}"
            )

            event.save(
                update_fields=["slug"]
            )

    # ========================================================
    # REGISTER FOR EVENT
    # ========================================================

    @action(
        detail=True,
        methods=["get", "post"],
        permission_classes=[
            permissions.IsAuthenticated
        ],
    )
    def register(self, request, slug=None):

        # Because lookup_field = "slug"
        # DRF resolves the event using its slug.
        event = self.get_object()

        # ====================================================
        # POST
        # ====================================================

        if request.method == "POST":

            data = dict(request.data)

            data["event"] = event.id

            profile = getattr(
                request.user,
                "profile",
                None,
            )

            # ------------------------------------------------
            # USER PROFILE DATA
            # ------------------------------------------------

            if profile:

                data.setdefault(
                    "full_name",
                    request.user.get_full_name(),
                )

                data.setdefault(
                    "register_number",
                    profile.register_number,
                )

                data.setdefault(
                    "department",
                    profile.department,
                )

                data.setdefault(
                    "year",
                    profile.year,
                )

                data.setdefault(
                    "email",
                    request.user.email,
                )

                data.setdefault(
                    "phone",
                    request.user.phone,
                )

                data.setdefault(
                    "college",
                    profile.college,
                )

            # ------------------------------------------------
            # FALLBACK VALUES
            # ------------------------------------------------

            data.setdefault(
                "full_name",
                request.user.get_full_name(),
            )

            data.setdefault(
                "email",
                request.user.email,
            )

            # ------------------------------------------------
            # SERIALIZE
            # ------------------------------------------------

            serializer = EventRegistrationSerializer(
                data=data
            )

            serializer.is_valid(
                raise_exception=True
            )

            registration = serializer.save(
                user=request.user
            )

            # ------------------------------------------------
            # WAITLIST
            # ------------------------------------------------

            if event.registration_status == "full":

                registration.status = "waitlist"

                registration.save(
                    update_fields=["status"]
                )

            # ------------------------------------------------
            # AWARD POINTS
            # ------------------------------------------------

            membership = get_membership_for_user(
                request.user
            )

            if membership:

                award_points(
                    membership,
                    10,
                    "event",
                    f"Registered for {event.title}",
                )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        # ====================================================
        # GET REGISTRATION STATUS
        # ====================================================

        registration = (
            event.registrations
            .filter(
                user=request.user
            )
            .first()
        )

        return Response(
            {
                "registered": bool(registration),

                "registration": (
                    EventRegistrationSerializer(
                        registration
                    ).data
                    if registration
                    else None
                ),
            }
        )


# ============================================================
# CERTIFICATE PRINT
# ============================================================

class CertificatePrintView(APIView):

    """
    Server-rendered printable certificate.
    Browser print can be used to save as PDF.
    """

    permission_classes = [
        permissions.AllowAny
    ]

    def get(self, request, pk):

        try:

            certificate = (
                Certificate.objects
                .select_related("event")
                .get(pk=pk)
            )

        except Certificate.DoesNotExist:

            return Response(
                {
                    "detail": "Not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        from django.shortcuts import render

        return render(
            request,
            "certificate.html",
            {
                "cert": certificate,

                "college_name":
                    WebsiteSetting.get(
                        "college_name",
                        "College Name",
                    ),

                "club_name":
                    WebsiteSetting.get(
                        "eco_club_name",
                        "ECO CLUB",
                    ),

                "code":
                    certificate.verification_code,
            },
        )


# ============================================================
# REGISTRATIONS
# ============================================================

class RegistrationViewSet(
    viewsets.ReadOnlyModelViewSet
):

    queryset = EventRegistration.objects.all()

    serializer_class = EventRegistrationSerializer

    filterset_fields = [
        "event",
        "status",
        "year",
    ]

    search_fields = [
        "full_name",
        "register_number",
        "email",
        "department",
    ]

    def get_permissions(self):

        return [
            permissions.IsAuthenticated()
        ]

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        if not (
            user.is_staff
            or user.is_staff_member()
        ):

            qs = qs.filter(
                user=user
            )

        return qs.select_related(
            "event"
        )


# ============================================================
# PARTICIPANTS
# ============================================================

class ParticipantViewSet(
    viewsets.ModelViewSet
):

    queryset = EventParticipant.objects.all()

    serializer_class = EventParticipantSerializer

    permission_classes = [
        permissions.IsAdminUser
    ]

    filterset_fields = [
        "event",
        "has_certificate",
    ]

    search_fields = [
        "full_name",
        "register_number",
    ]

    # ========================================================
    # CERTIFY PARTICIPANT
    # ========================================================

    @action(
        detail=True,
        methods=["post"],
    )
    def certify(
        self,
        request,
        pk=None,
    ):

        participant = self.get_object()

        participant.has_certificate = True

        participant.save(
            update_fields=[
                "has_certificate"
            ]
        )

        certificate, created = (
            Certificate.objects.get_or_create(
                event=participant.event,
                student=participant.student,
                defaults={
                    "full_name":
                        participant.full_name,

                    "register_number":
                        participant.register_number,
                },
            )
        )

        if (
            not created
            and participant.student
        ):

            certificate.student = (
                participant.student
            )

            certificate.save(
                update_fields=[
                    "student"
                ]
            )

        return Response(
            CertificateSerializer(
                certificate
            ).data
        )


# ============================================================
# CERTIFICATES
# ============================================================

class CertificateViewSet(
    viewsets.ReadOnlyModelViewSet
):

    queryset = Certificate.objects.all()

    serializer_class = CertificateSerializer

    filterset_fields = [
        "event",
        "student",
    ]

    search_fields = [
        "certificate_id",
        "full_name",
        "verification_code",
    ]

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        if not (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_staff_member()
            )
        ):

            profile = getattr(
                user,
                "profile",
                None,
            )

            if profile:

                qs = qs.filter(
                    student=profile
                )

            else:

                qs = qs.none()

        return qs.select_related(
            "event"
        )

    # ========================================================
    # VERIFY CERTIFICATE
    # ========================================================

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[
            permissions.AllowAny
        ],
    )
    def verify(self, request):

        code = (
            request.data.get("code")
            or request.data.get(
                "certificate_id"
            )
        )

        if not code:

            return Response(
                {
                    "detail":
                        "Verification code is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        certificate = (
            Certificate.objects
            .filter(
                verification_code__iexact=code
            )
            .first()
            or
            Certificate.objects
            .filter(
                certificate_id__iexact=code
            )
            .first()
        )

        if not certificate:

            return Response(
                {
                    "valid": False,
                    "detail":
                        "Certificate not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        certificate.is_verified = True

        certificate.save(
            update_fields=[
                "is_verified"
            ]
        )

        return Response(
            {
                "valid": True,

                "certificate":
                    CertificateSerializer(
                        certificate
                    ).data,
            }
        )

