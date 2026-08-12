from django.shortcuts import render
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

        # GET / HEAD / OPTIONS are public
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
    # PERMISSIONS
    # ========================================================

    def get_permissions(self):

        return [
            IsAdminOrReadOnly()
        ]

    # ========================================================
    # QUERYSET
    # ========================================================

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        is_admin = (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_staff_member()
            )
        )

        # Public users only see published events
        if not is_admin:
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

        if not event.slug:

            event.slug = (
                slugify(event.title)
                or f"event-{event.pk}"
            )

            event.save(
                update_fields=[
                    "slug"
                ]
            )


# ============================================================
# PUBLIC EVENT REGISTRATION
#
# IMPORTANT:
# This is a separate APIView.
#
# NO LOGIN REQUIRED.
# ============================================================

class EventRegisterView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    authentication_classes = []

    # ========================================================
    # GET REGISTRATION STATUS
    # ========================================================

    def get(self, request, slug):

        try:

            event = (
                Event.objects
                .prefetch_related("registrations")
                .get(
                    slug=slug,
                    is_published=True,
                )
            )

        except Event.DoesNotExist:

            return Response(
                {
                    "detail": "Event not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Anonymous user
        if not (
            request.user
            and request.user.is_authenticated
        ):

            return Response(
                {
                    "registered": False,
                    "registration": None,
                }
            )

        registration = (
            event.registrations
            .filter(
                user=request.user
            )
            .first()
        )

        return Response(
            {
                "registered": bool(
                    registration
                ),

                "registration": (
                    EventRegistrationSerializer(
                        registration
                    ).data
                    if registration
                    else None
                ),
            }
        )

    # ========================================================
    # POST REGISTRATION
    # ========================================================

    def post(self, request, slug):

        # ----------------------------------------------------
        # FIND EVENT
        # ----------------------------------------------------

        try:

            event = (
                Event.objects
                .get(
                    slug=slug,
                    is_published=True,
                )
            )

        except Event.DoesNotExist:

            return Response(
                {
                    "detail": "Event not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ----------------------------------------------------
        # CHECK EVENT STATUS
        # ----------------------------------------------------

        if event.registration_status == "closed":

            return Response(
                {
                    "detail":
                        "Registration is closed for this event."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if event.registration_status == "past":

            return Response(
                {
                    "detail":
                        "This event has already ended."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # COPY REQUEST DATA
        # ----------------------------------------------------

        data = request.data.copy()

        # Always use event from URL.
        data["event"] = event.pk

        # ----------------------------------------------------
        # AUTHENTICATED USER
        #
        # Authentication is OPTIONAL.
        # Anonymous users are allowed.
        # ----------------------------------------------------

        is_authenticated = (
            request.user
            and request.user.is_authenticated
        )

        # ----------------------------------------------------
        # LOGGED-IN USER DATA
        # ----------------------------------------------------

        if is_authenticated:

            profile = getattr(
                request.user,
                "profile",
                None,
            )

            # ----------------------------------------------
            # PROFILE
            # ----------------------------------------------

            if profile:

                data.setdefault(
                    "full_name",
                    request.user.get_full_name(),
                )

                data.setdefault(
                    "register_number",
                    getattr(
                        profile,
                        "register_number",
                        "",
                    ),
                )

                data.setdefault(
                    "department",
                    getattr(
                        profile,
                        "department",
                        "",
                    ),
                )

                data.setdefault(
                    "year",
                    getattr(
                        profile,
                        "year",
                        "",
                    ),
                )

                data.setdefault(
                    "college",
                    getattr(
                        profile,
                        "college",
                        "",
                    ),
                )

                data.setdefault(
                    "gender",
                    getattr(
                        profile,
                        "gender",
                        "",
                    ),
                )

            # ----------------------------------------------
            # USER
            # ----------------------------------------------

            data.setdefault(
                "full_name",
                request.user.get_full_name(),
            )

            data.setdefault(
                "email",
                request.user.email,
            )

            data.setdefault(
                "phone",
                getattr(
                    request.user,
                    "phone",
                    "",
                ),
            )

        # ----------------------------------------------------
        # VALIDATE
        # ----------------------------------------------------

        serializer = EventRegistrationSerializer(
            data=data
        )

        serializer.is_valid(
            raise_exception=True
        )

        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------

        registration = serializer.save(
            user=(
                request.user
                if is_authenticated
                else None
            )
        )

        # ----------------------------------------------------
        # WAITLIST
        # ----------------------------------------------------

        if event.registration_status == "full":

            registration.status = "waitlist"

            registration.save(
                update_fields=[
                    "status"
                ]
            )

        # ----------------------------------------------------
        # AWARD POINTS
        #
        # Only logged-in members receive points.
        # ----------------------------------------------------

        if is_authenticated:

            membership = (
                get_membership_for_user(
                    request.user
                )
            )

            if membership:

                award_points(
                    membership,
                    10,
                    "event",
                    f"Registered for {event.title}",
                )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            EventRegistrationSerializer(
                registration
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# CERTIFICATE PRINT
# ============================================================

class CertificatePrintView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    authentication_classes = []

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

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        qs = super().get_queryset()

        user = self.request.user

        is_admin = (
            user.is_staff
            or user.is_staff_member()
        )

        if not is_admin:

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

        is_admin = (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_staff_member()
            )
        )

        if not is_admin:

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
        authentication_classes=[],
    )
    def verify(
        self,
        request,
    ):

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