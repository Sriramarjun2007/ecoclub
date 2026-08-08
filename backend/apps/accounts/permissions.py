
from rest_framework.permissions import BasePermission


class IsClubAdmin(BasePermission):
    """
    Allows access to Eco Club administration APIs.

    Allowed:
    - Django superusers
    - Django staff users
    - Users with role='admin'
    - Users with role='staff'
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user

        # Not logged in
        if not user or not user.is_authenticated:
            return False

        # Full Django administrator
        if user.is_superuser:
            return True

        # Django staff
        if user.is_staff:
            return True

        # Eco Club role
        role = getattr(user, "role", None)

        if role in ("admin", "staff"):
            return True

        # Fallback for custom User model method
        try:
            if user.is_staff_member():
                return True
        except (AttributeError, TypeError):
            pass

        return False

