from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


# ============================================================
# USER
# ============================================================

class User(AbstractUser):

    ROLE_CHOICES = [
        ("admin", "Administrator"),
        ("staff", "College Staff"),
        ("student", "Student"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    is_approved = models.BooleanField(
        default=False,
    )

    def is_staff_member(self):
        """
        Returns True for Eco Club admin/staff roles.
        """

        return self.role in (
            "admin",
            "staff",
        )

    def __str__(self):
        return self.username


# ============================================================
# STUDENT PROFILE
# ============================================================

class StudentProfile(models.Model):

    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
    ]

    YEAR_CHOICES = [
        ("1", "1st Year"),
        ("2", "2nd Year"),
        ("3", "3rd Year"),
        ("4", "4th Year"),
        ("PG", "Graduate"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    register_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
    )

    department = models.CharField(
        max_length=120,
        blank=True,
    )

    year = models.CharField(
        max_length=5,
        choices=YEAR_CHOICES,
        blank=True,
    )

    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
    )

    college = models.CharField(
        max_length=200,
        blank=True,
    )

    profile_photo = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    areas_of_interest = models.TextField(
        blank=True,
    )

    bio_join = models.TextField(
        blank=True,
    )

    def __str__(self):
        return (
            self.register_number
            or self.user.username
        )


# ============================================================
# MEMBERSHIP
# ============================================================

class Membership(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    profile = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="membership",
    )

    membership_id = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
    )

    joined_on = models.DateField(
        auto_now_add=True,
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    eco_points = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        ordering = [
            "-joined_on",
        ]

    def __str__(self):
        return (
            self.membership_id
            or f"Membership {self.pk}"
        )


# ============================================================
# ECO POINT
# ============================================================

class EcoPoint(models.Model):

    REASON_CHOICES = [
        (
            "event",
            "Event Participation",
        ),
        (
            "tree",
            "Tree Plantation",
        ),
        (
            "campaign",
            "Campaign Volunteering",
        ),
        (
            "workshop",
            "Workshop Participation",
        ),
        (
            "award",
            "Special Award",
        ),
    ]

    member = models.ForeignKey(
        Membership,
        on_delete=models.CASCADE,
        related_name="points",
    )

    points = models.PositiveIntegerField()

    reason = models.CharField(
        max_length=20,
        choices=REASON_CHOICES,
    )

    description = models.CharField(
        max_length=255,
        blank=True,
    )

    awarded_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = [
            "-awarded_at",
        ]

    def __str__(self):
        return (
            f"{self.member.membership_id} - "
            f"{self.points} points"
        )


# ============================================================
# NOTIFICATION
# ============================================================

class Notification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    title = models.CharField(
        max_length=200,
    )

    message = models.TextField(
        blank=True,
    )

    link = models.CharField(
        max_length=300,
        blank=True,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        return self.title


# ============================================================
# AUTOMATIC MEMBERSHIP ID
# ============================================================

@receiver(post_save, sender=Membership)
def assign_membership_id(
    sender,
    instance,
    created,
    **kwargs,
):

    if created and not instance.membership_id:

        membership_id = (
            f"ECO-MEM-"
            f"{instance.joined_on.year}-"
            f"{instance.pk:05d}"
        )

        sender.objects.filter(
            pk=instance.pk
        ).update(
            membership_id=membership_id
        )

        # Keep current object in sync too.
        instance.membership_id = membership_id