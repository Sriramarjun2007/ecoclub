from django.utils.text import slugify
from rest_framework import permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import Membership
from apps.actions.models import WebsiteSetting
from apps.accounts.services import award_points, get_membership_for_user

from .models import Certificate, Event, EventParticipant, EventRegistration
from .serializers import (CertificateSerializer, EventDetailSerializer,
                          EventListSerializer, EventParticipantSerializer,
                          EventRegistrationSerializer)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (request.user and request.user.is_authenticated and
                (request.user.is_staff or request.user.is_staff_member()))


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().prefetch_related("sdgs", "registrations")
    serializer_class = EventListSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["category", "is_past", "sdgs", "is_published"]
    search_fields = ["title", "description", "venue", "organizer"]
    ordering_fields = ["date"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if not (u and u.is_authenticated and (u.is_staff or u.is_staff_member())):
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_class(self):
        return EventDetailSerializer if self.action == "retrieve" else EventListSerializer

    def perform_create(self, serializer):
        event = serializer.save()
        if not event.slug:
            event.slug = slugify(event.title) or f"event-{event.pk}"
            event.save(update_fields=["slug"])

    @action(detail=True, methods=["get", "post"],
            permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()
        if request.method == "POST":
            data = dict(request.data)
            data["event"] = event.id
            profile = getattr(request.user, "profile", None)
            if profile:
                data.setdefault("full_name", request.user.get_full_name())
                data.setdefault("register_number", profile.register_number)
                data.setdefault("department", profile.department)
                data.setdefault("year", profile.year)
                data.setdefault("email", request.user.email)
                data.setdefault("phone", request.user.phone)
                data.setdefault("college", profile.college)
            data.setdefault("full_name", request.user.get_full_name())
            data.setdefault("email", request.user.email)
            serializer = EventRegistrationSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            reg = serializer.save(user=request.user)
            if event.registration_status == "full":
                reg.status = "waitlist"; reg.save(update_fields=["status"])
            membership = get_membership_for_user(request.user)
            if membership:
                award_points(membership, 10, "event",
                             f"Registered for {event.title}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        reg = event.registrations.filter(user=request.user).first()
        return Response({"registered": bool(reg),
                         "registration": EventRegistrationSerializer(reg).data if reg else None})


class CertificatePrintView(APIView):
    """Server-rendered printable certificate (browser print -> PDF)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            cert = Certificate.objects.select_related("event").get(pk=pk)
        except Certificate.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        from django.shortcuts import render
        return render(request, "certificate.html", {
            "cert": cert,
            "college_name": WebsiteSetting.get("college_name", "College Name"),
            "club_name": WebsiteSetting.get("eco_club_name", "ECO CLUB"),
            "code": cert.verification_code,
        })

class RegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    filterset_fields = ["event", "status", "year"]
    search_fields = ["full_name", "register_number", "email", "department"]

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if not (u.is_staff or u.is_staff_member()):
            qs = qs.filter(user=u)
        return qs.select_related("event")


class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = EventParticipant.objects.all()
    serializer_class = EventParticipantSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ["event", "has_certificate"]
    search_fields = ["full_name", "register_number"]

    @action(detail=True, methods=["post"])
    def certify(self, request, pk=None):
        participant = self.get_object()
        participant.has_certificate = True
        participant.save(update_fields=["has_certificate"])
        cert, created = Certificate.objects.get_or_create(
            event=participant.event, student=participant.student,
            defaults={"full_name": participant.full_name,
                      "register_number": participant.register_number})
        if not created and participant.student:
            cert.student = participant.student; cert.save()
        return Response(CertificateSerializer(cert).data)


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    filterset_fields = ["event", "student"]
    search_fields = ["certificate_id", "full_name", "verification_code"]

    def get_queryset(self):
        qs = super().get_queryset()
        u = self.request.user
        if not (u and u.is_authenticated and (u.is_staff or u.is_staff_member())):
            profile = getattr(u, "profile", None)
            if profile:
                qs = qs.filter(student=profile)
            else:
                qs = qs.none()
        return qs.select_related("event")

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def verify(self, request):
        code = request.data.get("code") or request.data.get("certificate_id")
        if not code:
            return Response({"detail": "Verification code is required."}, status=400)
        cert = (Certificate.objects.filter(verification_code__iexact=code).first()
                or Certificate.objects.filter(certificate_id__iexact=code).first())
        if not cert:
            return Response({"valid": False, "detail": "Certificate not found."}, status=404)
        cert.is_verified = True; cert.save(update_fields=["is_verified"])
        return Response({"valid": True, "certificate": CertificateSerializer(cert).data})
