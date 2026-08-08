
from rest_framework import permissions


class IsClubAdmin(permissions.BasePermission):
    """
    Allows access to Eco Club administrators.

    A user is considered an admin if ANY of these are true:
    - Django superuser
    - Django staff user
    - role == "admin"
    - role == "staff"
    - custom is_staff_member() returns True
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Full Django superuser access
        if getattr(user, "is_superuser", False):
            return True

        # Django staff access
        if getattr(user, "is_staff", False):
            return True

        # Custom role access
        role = getattr(user, "role", None)

        if role in ["admin", "staff", "club_admin"]:
            return True

        # Custom model method, if available
        is_staff_member = getattr(
            user,
            "is_staff_member",
            None,
        )

        if callable(is_staff_member):
            try:
                if is_staff_member():
                    return True
            except Exception:
                pass

        return False

