from django.urls import include, path


urlpatterns = [
    # Authentication
    path(
        "auth/",
        include("apps.accounts.urls"),
    ),

    # Events + registrations + participants + certificates
    path(
        "",
        include("apps.events.urls"),
    ),

    # Settings + overview + impact + SDGs + gallery etc.
    path(
        "",
        include("apps.actions.urls"),
    ),
]