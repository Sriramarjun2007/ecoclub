"""
Django settings for the ECO CLUB platform.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv


# ============================================================
# BASE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-only-key-change-me",
)

DEBUG = os.environ.get(
    "DJANGO_DEBUG",
    "True",
).lower() in ("1", "true", "yes")


ALLOWED_HOSTS = [
    "ecoclub-3q19.onrender.com",
    "localhost",
    "127.0.0.1",
]


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",

    # Local apps
    "apps.accounts",
    "apps.events",
    "apps.actions",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [

    # CORS must be near the top
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL / APPLICATION
# ============================================================

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends.django.DjangoTemplates"
        ),

        "DIRS": [
            BASE_DIR / "templates",
        ],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:

    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=not DEBUG,
        )
    }

else:

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# ============================================================
# CUSTOM USER MODEL
# ============================================================

AUTH_USER_MODEL = "accounts.User"


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },

    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = os.environ.get(
    "TIME_ZONE",
    "Asia/Kolkata",
)

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


STORAGES = {

    "default": {
        "BACKEND": (
            "django.core.files.storage."
            "FileSystemStorage"
        ),
    },

    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage."
            "CompressedManifestStaticFilesStorage"
        ),
    },
}


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    # JWT Authentication
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication."
        "JWTAuthentication",
    ),

    # Default permissions
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions."
        "IsAuthenticatedOrReadOnly",
    ),

    # Filters
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework."
        "DjangoFilterBackend",

        "rest_framework.filters.SearchFilter",

        "rest_framework.filters.OrderingFilter",
    ),

    # Pagination
    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination."
        "PageNumberPagination"
    ),

    "PAGE_SIZE": 12,
}


# ============================================================
# JWT
# ============================================================

SIMPLE_JWT = {

    # Access token lifetime
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(
            os.environ.get(
                "JWT_ACCESS_LIFETIME_MINUTES",
                60,
            )
        )
    ),

    # Refresh token lifetime
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(
            os.environ.get(
                "JWT_REFRESH_LIFETIME_DAYS",
                7,
            )
        )
    ),

    # Keep refresh token reusable
    "ROTATE_REFRESH_TOKENS": False,

    "BLACKLIST_AFTER_ROTATION": False,

    # Authorization header
    "AUTH_HEADER_TYPES": (
        "Bearer",
    ),

    # User identification
    "USER_ID_FIELD": "id",

    "USER_ID_CLAIM": "user_id",

    "UPDATE_LAST_LOGIN": False,
}


# ============================================================
# FRONTEND / CORS
# ============================================================

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "https://ecoclub-madgwlj3y-sriramarjun12345-7056s-projects.vercel.app",
).rstrip("/")


CORS_ALLOWED_ORIGINS = [

    # Current Vercel deployment
    "https://ecoclub-madgwlj3y-sriramarjun12345-7056s-projects.vercel.app",

    # Previous Vercel deployment
    "https://ecoclub-ls0kkyt21-sriramarjun12345-7056s-projects.vercel.app",

    # Environment variable
    FRONTEND_URL,

    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "http://localhost:5174",
    "http://127.0.0.1:5174",

    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


CORS_ALLOW_CREDENTIALS = True


CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]


CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = [

    # Current Vercel deployment
    "https://ecoclub-madgwlj3y-sriramarjun12345-7056s-projects.vercel.app",

    # Previous Vercel deployment
    "https://ecoclub-ls0kkyt21-sriramarjun12345-7056s-projects.vercel.app",

    # Environment variable
    FRONTEND_URL,
]


# ============================================================
# PRODUCTION SECURITY
# ============================================================

if not DEBUG:

    CSRF_COOKIE_SECURE = True

    SESSION_COOKIE_SECURE = True

    SECURE_SSL_REDIRECT = True

    SECURE_HSTS_SECONDS = 31536000

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True

    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )


# ============================================================
# FILE UPLOAD LIMITS
# ============================================================

DATA_UPLOAD_MAX_MEMORY_SIZE = (
    5 * 1024 * 1024
)

FILE_UPLOAD_MAX_MEMORY_SIZE = (
    5 * 1024 * 1024
)