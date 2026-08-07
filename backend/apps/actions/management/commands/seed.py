"""Seed the ECO CLUB database with default data and a sample admin."""
import os
from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import Membership, User
from apps.actions.models import (Announcement, BlogPost, GalleryCategory,
                                 ImpactStatistic, SDG, SDGActivity, TeamMember,
                                 WebsiteSetting)
from apps.events.models import Event


DEFAULT_SETTINGS = {
    "college_name": os.environ.get("COLLEGE_NAME", "College Name"),
    "college_tagline": "Shaping Sustainable Futures",
    "eco_club_name": "ECO CLUB",
    "eco_club_tagline": "Creating awareness. Inspiring action. Building a sustainable future.",
    "email": "ecoclub@college.edu",
    "phone": "+91 00000 00000",
    "address": "Eco Club Office, Main Campus",
    "hero_title": "Together for a Greener Tomorrow",
    "hero_subtitle": "ECO CLUB — Empowering Students to Create Sustainable Change.",
    "footer_text": "Creating awareness. Inspiring action. Building a sustainable future.",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "twitter": "https://twitter.com",
    "linkedin": "https://linkedin.com",
    "youtube": "https://youtube.com",
    "map_url": "https://maps.google.com",
}

SDGS = [
    (3, "Good Health and Well-being", "health", "#4C9F38",
     "We promote clean air, green spaces and wellness through campus environmental action."),
    (6, "Clean Water and Sanitation", "water_drop", "#26BDE2",
     "Water conservation drives, rainwater awareness and campus sanitation programs."),
    (7, "Affordable and Clean Energy", "bolt", "#FCC30B",
     "Renewable energy awareness sessions and energy conservation campaigns."),
    (11, "Sustainable Cities and Communities", "apartment", "#FD9D24",
     "Campus sustainability, waste segregation and green infrastructure projects."),
    (12, "Responsible Consumption and Production", "recycling", "#BF8B2E",
     "Zero-waste initiatives, plastic-free campus drives and recycling workshops."),
    (13, "Climate Action", "eco", "#3F7E44",
     "Tree plantations, climate awareness and carbon footprint reduction drives."),
    (14, "Life Below Water", "water", "#0A97D9",
     "Clean water bodies awareness and plastic pollution reduction campaigns."),
    (15, "Life on Land", "forest", "#56C02B",
     "Biodiversity walks, tree plantations and campus greenery restoration."),
    (17, "Partnerships for the Goals", "handshake", "#19486A",
     "Collaborations with NGOs, institutions and community for sustainable impact."),
]

SDG_ACTIVITIES = {
    13: ["Tree Plantation", "Climate Awareness Campaigns", "Energy Conservation", "Carbon Footprint Awareness"],
    3: ["Wellness Walks", "Clean Air Drives"],
    6: ["Water Conservation Drives", "Campus Sanitation Programs"],
    7: ["Energy Audit Campaigns", "Renewable Energy Awareness"],
    11: ["Waste Segregation Drive", "Green Campus Projects"],
    12: ["Plastic-Free Campus", "Recycling Workshops"],
    14: ["Water Body Clean-ups", "Ocean & Rivers Awareness"],
    15: ["Biodiversity Walks", "Native Tree Plantation"],
    17: ["NGO Partnerships", "Community Outreach Programs"],
}

EVENTS = [
    dict(title="Mega Tree Plantation Drive 2026", category="plantation",
         description="Join hundreds of students to plant native trees across three campus locations and fight climate change.",
         venue="Main Campus Grounds", date="2026-08-20", start=time(9, 0), end=time(13, 0),
         coordinator="Dr. R. Kumar", sdgs=[13, 15], max=300),
    dict(title="Climate Action Awareness Week", category="awareness",
         description="A week of talks, posters and activities building climate consciousness among students.",
         venue="Seminar Hall", date="2026-09-05", start=time(10, 0), end=time(16, 0),
         coordinator="Prof. A. Nair", sdgs=[13], max=200),
    dict(title="Water Conservation Workshop", category="workshop",
         description="Hands-on workshop on rainwater harvesting and responsible water use.",
         venue="Science Block", date="2026-09-18", start=time(11, 0), end=time(14, 0),
         coordinator="Er. V. Menon", sdgs=[6], max=80),
    dict(title="Clean Campus Clean Green Drive", category="clean",
         description="Student volunteers clean and beautify the campus while segregating waste.",
         venue="Main Campus", date="2026-10-02", start=time(8, 0), end=time(11, 0),
         coordinator="Student Council", sdgs=[11, 12], max=250),
    dict(title="Green Quiz Competition", category="competition",
         description="Inter-department sustainability quiz. Test your environmental knowledge!",
         venue="Auditorium", date="2026-10-20", start=time(14, 0), end=time(17, 0),
         coordinator="Ms. L. Rose", sdgs=[13, 4], max=120),
]

TEAM = [
    ("faculty", "Dr. S. Kumar", "Faculty Coordinator", "Department of Botany"),
    ("student_coordinator", "Ananya S", "Student Coordinator", "Computer Science", "3"),
    ("executive", "Rahul V", "Executive Member", "Mechanical", "2"),
    ("executive", "Divya R", "Executive Member", "Environmental Science", "2"),
    ("executive", "Arjun M", "Executive Member", "Electrical", "3"),
    ("executive", "Nandini K", "Executive Member", "Biotechnology", "1"),
]


class Command(BaseCommand):
    help = "Seed the ECO CLUB database with defaults, an admin and sample content."

    def handle(self, *args, **options):
        for key, value in DEFAULT_SETTINGS.items():
            WebsiteSetting.objects.get_or_create(key=key, defaults={"value": value, "label": key.replace("_", " ").title()})

        for num, name, icon, color, contribution in SDGS:
            sdg, _ = SDG.objects.get_or_create(
                number=num,
                defaults={"name": name, "icon": icon, "color": color,
                          "contribution": contribution,
                          "short_name": name, "is_featured": (num == 13)})
            for act in SDG_ACTIVITIES.get(num, []):
                SDGActivity.objects.get_or_create(sdg=sdg, title=act)

        from django.utils.text import slugify
        for cat in ["Tree Plantation", "Clean Campus", "Awareness Campaigns",
                    "Workshops", "Seminars", "Competitions", "Community Outreach",
                    "Celebrations", "Volunteers", "Other"]:
            GalleryCategory.objects.get_or_create(name=cat, defaults={"slug": slugify(cat)})

        for metric, value, unit, icon in [
            ("trees", 1500, "trees", "park"), ("waste", 8200, "kg", "delete"),
            ("water", 240000, "litres", "water_drop"), ("volunteers", 950, "", "groups"),
            ("students", 3600, "", "school"), ("campaigns", 64, "", "campaign"),
            ("events", 120, "", "event"), ("members", 1400, "", "group")]:
            ImpactStatistic.objects.get_or_create(metric=metric,
                defaults={"value": value, "unit": unit, "icon": icon})

        for role, name, pos, dept, *rest in TEAM:
            TeamMember.objects.get_or_create(name=name, defaults={"role": role,
                "position": pos, "department": dept,
                "year": rest[0] if rest else ""})

        from datetime import date as _date
        for item in EVENTS:
            ev, _ = Event.objects.get_or_create(
                title=item["title"], defaults={"category": item["category"],
                    "description": item["description"], "venue": item["venue"],
                    "date": _date.fromisoformat(item["date"]),
                    "start_time": item["start"], "end_time": item["end"],
                    "coordinator": item["coordinator"],
                    "max_participants": item["max"],
                    "slug": slugify(item["title"])})
            ev.sdgs.set(SDG.objects.filter(number__in=item["sdgs"]))

        Announcement.objects.get_or_create(
            title="Registration open for the Mega Drive 2026",
            defaults={"body": "Plant a tree, build a future. Register before the deadline!",
                      "category": "registration", "is_pinned": True})

        BlogPost.objects.get_or_create(
            title="How Our Students Are Fighting Climate Change",
            defaults={"excerpt": "Small campus actions add up to a greener tomorrow.",
                      "content": "Students are leading plantations, waste drives and energy audits across campus.",
                      "category": "climate", "author": "ECO CLUB Media Team",
                      "tags": "climate, sdg13, sustainability"})

        # Default admin
        email = os.environ.get("ADMIN_EMAIL", "admin@ecoclub.edu")
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                username=email.split("@")[0], email=email,
                password=os.environ.get("ADMIN_PASSWORD", "ChangeMe123!"),
                first_name=os.environ.get("ADMIN_FIRST_NAME", "College"),
                last_name=os.environ.get("ADMIN_LAST_NAME", "Administrator"),
                role="admin", is_approved=True)
            self.stdout.write(f"Created admin: {email}")

        self.stdout.write(self.style.SUCCESS("ECO CLUB database seeded successfully."))
