from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import serializers

from .models import EcoPoint, Membership, Notification, StudentProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name",
                  "full_name", "role", "phone", "is_approved")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ("id", "user", "register_number", "department", "year", "gender",
                  "college", "profile_photo", "areas_of_interest", "bio_join")


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    register_number = serializers.CharField()
    department = serializers.CharField()
    year = serializers.ChoiceField(choices=["1", "2", "3", "4", "PG"], required=False)
    gender = serializers.ChoiceField(choices=["M", "F", "O"], required=False)
    college = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    areas_of_interest = serializers.CharField(required=False, allow_blank=True)
    bio_join = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_register_number(self, value):
        value = value.strip()
        if StudentProfile.objects.filter(register_number=value).exists():
            raise serializers.ValidationError("This register number is already registered.")
        return value


class MembershipSerializer(serializers.ModelSerializer):
    profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ("id", "membership_id", "status", "joined_on", "eco_points", "profile")


class EcoPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcoPoint
        fields = ("id", "points", "reason", "description", "awarded_at")


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "title", "message", "is_read", "created_at")
