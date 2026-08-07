"""Helpers shared across apps: notifications, eco points, membership lookup."""
from .models import EcoPoint, Membership, Notification


def notify(user, title, message="", link=""):
    Notification.objects.create(user=user, title=title, message=message, link=link)


def award_points(member, points, reason, description=""):
    EcoPoint.objects.create(member=member, points=points, reason=reason,
                            description=description)
    member.eco_points += points
    member.save(update_fields=["eco_points"])


def get_membership_for_user(user):
    profile = getattr(user, "profile", None)
    return getattr(profile, "membership", None) if profile else None
