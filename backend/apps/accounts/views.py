
from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Membership, StudentProfile
from .serializers import (
    EcoPointSerializer,
    MembershipSerializer,
    NotificationSerializer,
    RegisterSerializer,
    StudentProfileSerializer,
    UserSerializer,
)


User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        base = data["email"].split("@")[0]
        username = base
        n = 1

        while User.objects.filter(username=username).exists():
            username = f"{base}{n}"
            n += 1

        user = User.objects.create_user(
            username=username,
            email=data["email"],
            password=data["password"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            phone=data.get("phone", ""),
            role="student",
        )

        profile = StudentProfile.objects.create(
            user=user,
            register_number=data.get("register_number", ""),
            department=data.get("department", ""),
            year=data.get("year", ""),
            gender=data.get("gender", ""),
            college=data.get("college", ""),
            areas_of_interest=data.get("areas_of_interest", ""),
            bio_join=data.get("bio_join", ""),
        )

        membership = Membership.objects.create(
            profile=profile,
            status="pending",
        )

        return Response(
            {
                "message": "Registration successful. Membership pending approval.",
                "membership_id": membership.membership_id,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)
        membership = (
            getattr(profile, "membership", None)
            if profile
            else None
        )

        return Response(
            {
                "user": UserSerializer(user).data,
                "profile": (
                    StudentProfileSerializer(profile).data
                    if profile
                    else None
                ),
                "membership": (
                    MembershipSerializer(membership).data
                    if membership
                    else None
                ),
                "notifications": NotificationSerializer(
                    user.notifications.filter(is_read=False)[:6],
                    many=True,
                ).data,
            }
        )


class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile = getattr(request.user, "profile", None)

        if not profile:
            return Response(
                {"detail": "No student profile."},
                status=400,
            )

        serializer = StudentProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class MembershipListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user

        is_admin = (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or user.is_staff_member()
            )
        )

        if is_admin:
            qs = Membership.objects.all()
        else:
            qs = Membership.objects.filter(
                status="approved"
            )

        qs = qs.select_related(
            "profile",
            "profile__user",
        )

        query = request.query_params.get("q")

        if query:
            qs = qs.filter(
                profile__register_number__icontains=query
            )

        return Response(
            MembershipSerializer(
                qs[:100],
                many=True,
            ).data
        )


class EcoPointsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = getattr(
            request.user,
            "profile",
            None,
        )

        membership = (
            getattr(profile, "membership", None)
            if profile
            else None
        )

        if not membership:
            return Response(
                {"detail": "No membership."},
                status=404,
            )

        return Response(
            {
                "total": membership.eco_points,
                "history": EcoPointSerializer(
                    membership.points.all(),
                    many=True,
                ).data,
            }
        )


class NotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            NotificationSerializer(
                request.user.notifications.all()[:30],
                many=True,
            ).data
        )

    def post(self, request):
        request.user.notifications.update(
            is_read=True
        )

        return Response(
            {
                "detail": "All notifications marked as read."
            }
        )


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not request.user.check_password(
            old_password or ""
        ):
            return Response(
                {
                    "detail": "Old password is incorrect."
                },
                status=400,
            )

        if len(new_password or "") < 6:
            return Response(
                {
                    "detail": "Password too short."
                },
                status=400,
            )

        request.user.set_password(new_password)
        request.user.save()

        return Response(
            {
                "detail": "Password updated successfully."
            }
        )


class MembershipAdminView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        new_status = request.data.get("status")

        try:
            membership = (
                Membership.objects
                .select_related("profile")
                .get(pk=pk)
            )
        except Membership.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=404,
            )

        if new_status not in (
            "approved",
            "rejected",
            "pending",
        ):
            return Response(
                {"detail": "Invalid status."},
                status=400,
            )

        membership.status = new_status
        membership.save(
            update_fields=["status"]
        )

        if new_status == "approved":
            membership.profile.user.is_approved = True

            membership.profile.user.save(
                update_fields=["is_approved"]
            )

        return Response(
            MembershipSerializer(membership).data
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")

            if refresh_token:
                RefreshToken(
                    refresh_token
                ).blacklist()

        except Exception:
            pass

        return Response(
            {
                "detail": "Logged out."
            }
        )

