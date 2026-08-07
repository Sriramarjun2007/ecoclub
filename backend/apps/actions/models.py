from django.db import models
from django.utils import timezone


class SDG(models.Model):
    """Sustainable Development Goal linked to the club."""

    number = models.PositiveSmallIntegerField(unique=True)
    name = models.CharField(max_length=120)
    short_name = models.CharField(max_length=60, blank=True)
    description = models.TextField(blank=True)
    contribution = models.TextField(blank=True, help_text="Eco Club contribution to this SDG")
    icon = models.CharField(max_length=20, blank=True,
                            help_text="Material icon name e.g. eco, water_drop, energy_savings_leaf")
    color = models.CharField(max_length=20, default="#4CAF50")
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"SDG {self.number} — {self.name}"


class SDGActivity(models.Model):
    sdg = models.ForeignKey(SDG, on_delete=models.CASCADE, related_name="activities")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.sdg.number} · {self.title}"


class GalleryCategory(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=70, unique=True, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Gallery categories"

    def __str__(self):
        return self.name


class GalleryImage(models.Model):
    title = models.CharField(max_length=200, blank=True)
    caption = models.CharField(max_length=300, blank=True)
    image = models.ImageField(upload_to="gallery/")
    category = models.ForeignKey(GalleryCategory, on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name="images")
    event = models.ForeignKey("events.Event", on_delete=models.SET_NULL,
                              null=True, blank=True, related_name="gallery")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title or f"Image {self.pk}"


class Memory(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    photo = models.ImageField(upload_to="memories/", blank=True, null=True)
    year = models.PositiveSmallIntegerField(default=timezone.now().year)
    date = models.DateField(blank=True, null=True)
    event = models.ForeignKey("events.Event", on_delete=models.SET_NULL,
                              null=True, blank=True, related_name="memories")
    participants = models.PositiveIntegerField(default=0)
    is_highlight = models.BooleanField(default=False)

    class Meta:
        ordering = ["-year", "-date"]

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    ROLE_CHOICES = [("faculty", "Faculty Coordinator"),
                    ("student_coordinator", "Student Coordinator"),
                    ("executive", "Executive Member")]
    role = models.CharField(max_length=25, choices=ROLE_CHOICES)
    name = models.CharField(max_length=150)
    position = models.CharField(max_length=150, blank=True)
    designation = models.CharField(max_length=150, blank=True)
    department = models.CharField(max_length=120, blank=True)
    year = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    photo = models.ImageField(upload_to="team/", blank=True, null=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["role", "sort_order"]

    def __str__(self):
        return self.name


class Announcement(models.Model):
    CATEGORY_CHOICES = [("event", "Event"), ("registration", "Registration"),
                        ("competition", "Competition"), ("result", "Results"),
                        ("notice", "Notice"), ("volunteer", "Volunteer Opportunity")]
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="notice")
    is_pinned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_pinned", "-created_at"]

    def __str__(self):
        return self.title


class BlogPost(models.Model):
    CATEGORY_CHOICES = [("environment", "Environment"), ("climate", "Climate"),
                        ("sustainability", "Sustainability"), ("campus", "Campus"),
                        ("sdgs", "SDGs"), ("activities", "Student Activities")]
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    cover_image = models.ImageField(upload_to="blog/", blank=True, null=True)
    author = models.CharField(max_length=150, blank=True)
    content = models.TextField()
    excerpt = models.CharField(max_length=400, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="environment")
    tags = models.CharField(max_length=300, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=250)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.subject}"


class ImpactStatistic(models.Model):
    METRIC_CHOICES = [("trees", "Trees Planted"), ("waste", "Waste Collected (kg)"),
                      ("water", "Water Saved (litres)"), ("volunteers", "Volunteers"),
                      ("students", "Students Reached"), ("campaigns", "Campaigns Conducted"),
                      ("events", "Events Conducted"), ("members", "Total Members")]
    metric = models.CharField(max_length=20, choices=METRIC_CHOICES, unique=True)
    value = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=30, blank=True)
    icon = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["metric"]

    def __str__(self):
        return f"{self.metric}: {self.value}"


class WebsiteSetting(models.Model):
    key = models.SlugField(max_length=60, unique=True)
    value = models.TextField(blank=True)
    label = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["key"]

    def __str__(self):
        return self.key

    @classmethod
    def get(cls, key, default=""):
        row = cls.objects.filter(key=key).first()
        return row.value if row else default


class UploadedFile(models.Model):
    purpose = models.CharField(max_length=30, default="logo")
    name = models.CharField(max_length=120)
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
