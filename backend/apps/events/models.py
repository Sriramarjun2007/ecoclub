import uuid
from django.db import models
from django.utils import timezone


class Event(models.Model):
    CATEGORY_CHOICES = [
        ("plantation", "Tree Plantation"), ("clean", "Clean Campus"),
        ("awareness", "Awareness Campaign"), ("workshop", "Workshop"),
        ("seminar", "Seminar"), ("competition", "Competition"),
        ("community", "Community Outreach"), ("celebration", "Celebration"),
        ("other", "Other")]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    agenda = models.TextField(blank=True)
    rules = models.TextField(blank=True)
    banner = models.ImageField(upload_to="events/banners/", blank=True, null=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(blank=True, null=True)
    venue = models.CharField(max_length=250)
    organizer = models.CharField(max_length=150, blank=True)
    coordinator = models.CharField(max_length=150, blank=True)
    max_participants = models.PositiveIntegerField(default=100)
    registration_deadline = models.DateField(blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    sdgs = models.ManyToManyField("actions.SDG", blank=True, related_name="events")
    is_past = models.BooleanField(default=False)
    impact_text = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return self.title

    @property
    def registration_status(self):
        if self.is_past:
            return "past"
        if (self.registration_deadline and
                self.registration_deadline < timezone.localdate()):
            return "closed"
        if self.registrations.filter(status__in=["confirmed", "waitlist"]).count() >= self.max_participants:
            return "full"
        return "open"


class EventRegistration(models.Model):
    STATUS_CHOICES = [("confirmed", "Confirmed"), ("waitlist", "Waitlist"),
                      ("cancelled", "Cancelled")]
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True,
                             blank=True, related_name="event_registrations")
    full_name = models.CharField(max_length=150)
    register_number = models.CharField(max_length=30)
    department = models.CharField(max_length=120)
    year = models.CharField(max_length=5, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=1, blank=True)
    college = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    registration_id = models.CharField(max_length=30, unique=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["event", "register_number"],
                                               name="unique_event_register_number")]

    def __str__(self):
        return f"{self.full_name} -> {self.event.title}"


class EventParticipant(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="participants")
    student = models.ForeignKey("accounts.StudentProfile", on_delete=models.SET_NULL,
                                null=True, blank=True, related_name="participations")
    full_name = models.CharField(max_length=150)
    register_number = models.CharField(max_length=30)
    attended_on = models.DateField(default=timezone.localdate)
    points_awarded = models.PositiveIntegerField(default=0)
    has_certificate = models.BooleanField(default=False)

    class Meta:
        ordering = ["-attended_on"]
        constraints = [models.UniqueConstraint(fields=["event", "register_number"],
                                               name="unique_event_participant")]


class Certificate(models.Model):
    certificate_id = models.CharField(max_length=40, unique=True, blank=True)
    verification_code = models.CharField(max_length=20, unique=True, blank=True)
    student = models.ForeignKey("accounts.StudentProfile", on_delete=models.SET_NULL,
                                null=True, blank=True, related_name="certificates")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="certificates")
    full_name = models.CharField(max_length=150)
    register_number = models.CharField(max_length=30, blank=True)
    issued_on = models.DateField(default=timezone.localdate)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ["-issued_on"]

    def __str__(self):
        return self.certificate_id or f"Cert {self.pk}"

from django.db.models.signals import post_save


def assign_registration_id(sender, instance, created, **kwargs):
    if created and not instance.registration_id:
        instance.registration_id = f"ECO-{instance.created_at.year}-{instance.pk:06d}"
        type(instance).objects.filter(pk=instance.pk).update(registration_id=instance.registration_id)

post_save.connect(assign_registration_id, sender=EventRegistration)


def assign_certificate_fields(sender, instance, created, **kwargs):
    if not instance.verification_code:
        instance.verification_code = uuid.uuid4().hex[:12].upper()
        type(instance).objects.filter(pk=instance.pk).update(verification_code=instance.verification_code)
    if created and not instance.certificate_id:
        instance.certificate_id = f"ECO-CERT-{instance.issued_on.year}-{instance.pk:05d}"
        type(instance).objects.filter(pk=instance.pk).update(certificate_id=instance.certificate_id)

post_save.connect(assign_certificate_fields, sender=Certificate)
