# 🌍 ECO CLUB — College Environmental Organization Website

A **full-stack, production-ready web platform** for a college environmental club
operating under the **United Nations Sustainable Development Goals (SDGs)**.

Built as an official college organization portal combining:

**College branding + Eco Club + SDGs + 3D Experience + Events + Registration +
Gallery + Memories + Membership + Certificates + Eco Points + Environmental
Impact + Admin Dashboard + Database + REST API.**

---

## ✨ Feature Highlights

- **Interactive 3D Earth hero** (React Three Fiber) with floating environmental
  particles + static fallback for non-WebGL / low-end devices.
- **SDG hub** — 9 goals, interactive cards, contribution & activities (SDG 13 featured).
- **Event system** — upcoming/past, detail pages, capacity tracking, deadlines,
  animated cards.
- **Event registration** — unique IDs (`ECO-2026-000124`), duplicate prevention,
  waitlist/full states, eco-points awarded on registration.
- **Membership system** — join form with areas of interest, membership IDs
  (`ECO-MEM-2026-00421`), admin approval.
- **Student dashboard** — profile, membership, registered events, eco points,
  certificates, environmental impact progress.
- **Certificate system** — admin generates certificates, printable/PDF with QR
  verification code, public verification page `/verify/<code>`.
- **Impact dashboard** — live animated counters + charts, all from the DB.
- **Photo gallery** — masonry + lightbox + category filter.
- **Moments** — cinematic timeline.
- **Team** — faculty coordinator, student coordinator, executive members.
- **Announcements, Blog, Contact (stored in DB).**
- **Powerful Admin Dashboard** — manage students, events, registrations,
  gallery, team, SDGs, announcements, blog, certificates, messages, impact
  stats, and website settings (college name/logo, contact, mission, vision).
- **Auth & security** — JWT, password hashing, role-based access, CSRF, input
  validation, protected admin routes, duplicate-registration prevention.
- **PostgreSQL (prod) / SQLite (dev)** with migrations.
- **SEO**, responsive design, accessibility, lazy-loaded 3D & images.

---

## 🧱 Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18, Vite, Tailwind CSS, Three.js, React Three Fiber, Framer Motion |
| Backend   | Python, Django 5, Django REST Framework, SimpleJWT |
| Database  | PostgreSQL (production) / SQLite (development) |
| Auth      | JWT (access + refresh), role-based authorization |

---

## 📁 Project Structure

```
eco-club/
├── backend/
│   ├── config/                 # Django project (settings, urls)
│   ├── apps/
│   │   ├── accounts/           # User, StudentProfile, Membership, EcoPoints, Notifications
│   │   ├── events/             # Event, Registration, Participant, Certificate
│   │   └── actions/            # SDG, Gallery, Memories, Team, Blog, Announcements, Impact, Settings
│   ├── templates/certificate.html
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/         # Navbar, Footer, Earth3D, cards, counters, ...
    │   ├── pages/              # Home, About, SDGs, Events, Gallery, Moments, Team, Blog, Join, Login, Dashboard, Admin, Verify, ...
    │   ├── context/            # Auth + Settings providers
    │   └── lib/                # API client (axios + JWT refresh), toast
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started (Development)

### 1. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # optionally adjust settings

python manage.py migrate
python manage.py seed           # creates SDGs, events, settings, admin, sample content
python manage.py runserver     # http://127.0.0.1:8000
```

Default admin (from `seed`):
- Email: `admin@ecoclub.edu`
- Password: `ChangeMe123!`  *(change immediately)*

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

The Vite dev server proxies `/api` and `/media` to the Django server on port
`8000`.

---

## 🔑 Auth & Roles

| Role  | Access |
|-------|--------|
| **admin / staff** | Full admin dashboard, all write operations, approvals, certificates |
| **student** | Register for events, dashboard, eco points, certificates |
| **visitor** | Read-only public pages |

---

## 🌍 Key REST API Endpoints

```
POST  /api/auth/login/                JWT login
POST  /api/auth/register/           Student + membership registration
GET   /api/auth/me/                 Current user + membership + notifications
PATCH /api/auth/memberships/<id>/   Approve / reject membership (admin)
GET   /api/auth/points/             Eco points + history
GET/POST /api/events/              Event catalog / create (admin)
GET   /api/events/<id>/             Event detail
POST  /api/events/<id>/register/    Register for an event
GET   /api/gallery/  /api/memories/ /api/team/ /api/sdgs/
GET   /api/announcements/ /api/blog/ /api/impact/ /api/settings/
POST  /api/contact/                Contact form (stored)
GET   /api/contact/admin/          View messages (admin)
POST  /api/certificates/verify/    Verify a certificate
GET   /api/certificates/<id>/print/  Printable certificate (PDF)
```

---

## 🧪 Verification Flow (example)

1. Student **registers** → gets `ECO-MEM-…` pending membership.
2. Admin **approves** membership.
3. Student **registers for an event** → unique `ECO-…` ID + `+10` eco points.
4. Admin marks the student as a **participant** and **generates a certificate**
   → `ECO-CERT-…` with a digital verification code.
5. Student **downloads** the certificate (PDF) and/or anyone **verifies** it at
   `/verify/<code>`.

---

## 🔒 Security Notes

- Secrets via environment variables (`.env`), never committed.
- Password hashing via Django's default `PBKDF2`/`Argon2`.
- JWT access + rotating refresh tokens with blacklist.
- Role-based API permissions; protected admin routes.
- Upload size limits + image type validation (Pillow).
- Duplicate event registration prevented at DB + serializer level.

---

© 2026 ECO CLUB | [COLLEGE NAME]. All Rights Reserved.