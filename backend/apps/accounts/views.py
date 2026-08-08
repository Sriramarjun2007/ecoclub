
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


# ============================================================
# CUSTOM ADMIN PERMISSION
# ============================================================

class IsClubAdmin(permissions.BasePermission):
    """
    Allows authenticated Django staff users or users recognized
    by the project's custom is_staff_member() method.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Normal Django admin/staff user
        if user.is_staff:
            return True

        # Project-specific staff/admin check
        if hasattr(user, "is_staff_member"):
            try:
                return bool(user.is_staff_member())
            except Exception:
                return False

        return False


# ============================================================
# REGISTER
# ============================================================

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
            areas_of_interest=data.get(
                "areas_of_interest",
                "",
            ),
            bio_join=data.get(
                "bio_join",
                "",
            ),
        )

        membership = Membership.objects.create(
            profile=profile,
            status="pending",
        )

        return Response(
            {
                "message": (
                    "Registration successful. "
                    "Membership pending approval."
                ),
                "membership_id": membership.membership_id,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# CURRENT USER
# ============================================================

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        profile = getattr(
            user,
            "profile",
            None,
        )

        membership = (
            getattr(
                profile,
                "membership",
                None,
            )
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
                    user.notifications.filter(
                        is_read=False
                    )[:6],
                    many=True,
                ).data,
            }
        )


# ============================================================
# UPDATE PROFILE
# ============================================================

class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile = getattr(
            request.user,
            "profile",
            None,
        )

        if not profile:
            return Response(
                {
                    "detail": "No student profile."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = StudentProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )


# ============================================================
# MEMBERSHIP LIST
# ============================================================

class MembershipListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user

        is_admin = (
            user
            and user.is_authenticated
            and (
                user.is_staff
                or (
                    hasattr(user, "is_staff_member")
                    and user.is_staff_member()
                )
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


# ============================================================
# ECO POINTS
# ============================================================

class EcoPointsView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):
        profile = getattr(
            request.user,
            "profile",
            None,
        )

        membership = (
            getattr(
                profile,
                "membership",
                None,
            )
            if profile
            else None
        )

        if not membership:
            return Response(
                {
                    "detail": "No membership."
                },
                status=status.HTTP_404_NOT_FOUND,
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


# ============================================================
# NOTIFICATIONS
# ============================================================

class NotificationsView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

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
                "detail": (
                    "All notifications marked as read."
                )
            }
        )


# ============================================================
# CHANGE PASSWORD
# ============================================================

class ChangePasswordView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):
        old_password = request.data.get(
            "old_password"
        )

        new_password = request.data.get(
            "new_password"
        )

        if not request.user.check_password(
            old_password or ""
        ):
            return Response(
                {
                    "detail": (
                        "Old password is incorrect."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password or "") < 6:
            return Response(
                {
                    "detail": "Password too short."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(
            new_password
        )

        request.user.save()

        return Response(
            {
                "detail": (
                    "Password updated successfully."
                )
            }
        )


# ============================================================
# ADMIN MEMBERSHIP MANAGEMENT
# ============================================================

class MembershipAdminView(APIView):
    """
    Admin endpoint for approving/rejecting memberships.

    URL:
        /api/auth/memberships/<id>/

    The important fix here is using IsClubAdmin instead of
    DRF's IsAdminUser.
    """

    permission_classes = [IsClubAdmin]

    def patch(self, request, pk):
        new_status = request.data.get(
            "status"
        )

        # ----------------------------------------------------
        # Validate status
        # ----------------------------------------------------

        if new_status not in (
            "approved",
            "rejected",
            "pending",
        ):
            return Response(
                {
                    "detail": "Invalid status."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # Find membership
        # ----------------------------------------------------

        try:
            membership = (
                Membership.objects
                .select_related(
                    "profile",
                    "profile__user",
                )
                .get(pk=pk)
            )

        except Membership.DoesNotExist:
            return Response(
                {
                    "detail": "Membership not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ----------------------------------------------------
        # Update membership status
        # ----------------------------------------------------

        membership.status = new_status

        membership.save(
            update_fields=[
                "status"
            ]
        )

        # ----------------------------------------------------
        # Update user's approval status
        # ----------------------------------------------------

        user = membership.profile.user

        if new_status == "approved":
            user.is_approved = True

            user.save(
                update_fields=[
                    "is_approved"
                ]
            )

        elif new_status == "rejected":
            user.is_approved = False

            user.save(
                update_fields=[
                    "is_approved"
                ]
            )

        elif new_status == "pending":
            user.is_approved = False

            user.save(
                update_fields=[
                    "is_approved"
                ]
            )

        # ----------------------------------------------------
        # Return updated membership
        # ----------------------------------------------------

        return Response(
            MembershipSerializer(
                membership
            ).data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# LOGOUT
# ============================================================

class LogoutView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):
        try:
            refresh_token = request.data.get(
                "refresh"
            )

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

