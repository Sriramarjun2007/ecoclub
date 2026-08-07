from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView,
                                            TokenVerifyView)

from .views import (ChangePasswordView, EcoPointsView, LogoutView,
                    MembershipAdminView, MembershipListView, MeView,
                    NotificationsView, RegisterView, UpdateProfileView)

app_name = "accounts"

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token-verify"),
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", UpdateProfileView.as_view(), name="profile"),
    path("memberships/", MembershipListView.as_view(), name="memberships"),
    path("memberships/<int:pk>/", MembershipAdminView.as_view(), name="membership-admin"),
    path("points/", EcoPointsView.as_view(), name="points"),
    path("notifications/", NotificationsView.as_view(), name="notifications"),
    path("password/change/", ChangePasswordView.as_view(), name="password-change"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
