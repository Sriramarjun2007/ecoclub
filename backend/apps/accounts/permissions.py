from rest_framework.permissions import BasePermission


class IsClubAdmin(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        if user.is_staff:
            return True

        try:
            if user.is_staff_member():
                return True
        except Exception:
            pass

        role = getattr(user, "role", None)

        if role in (
            "admin",
            "staff",
            "faculty",
            "club_admin",
        ):
            return True

        return False