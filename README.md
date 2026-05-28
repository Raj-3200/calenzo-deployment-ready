# Calenzo — Clinic Appointment & Queue Management System

A production-ready clinic management system built with Next.js 16, Clerk authentication, Prisma ORM, and PostgreSQL (Neon).

---

## Features

- ✅ Clerk authentication (sign-in, sign-up, sign-out)
- ✅ Role-based access (Admin, Doctor, Receptionist, Patient)
- ✅ Patient registration & profile management
- ✅ Multi-step appointment booking flow
- ✅ Real-time queue with PostgreSQL LISTEN/NOTIFY + Server-Sent Events
- ✅ Admin dashboard with live database stats
- ✅ Queue management (arrived, start, complete, skip, recall, cancel)
- ✅ Walk-in booking
- ✅ Follow-up management
- ✅ WhatsApp quick action links
- ✅ Analytics with Recharts
- ✅ Clinic settings management
- ✅ Dark premium UI with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk v7 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma v6 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Validation | Zod |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd calenzo
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...      # Non-pooled URL for migrations

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/patient/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/patient/profile

# App
DEFAULT_CLINIC_ID=00000000-0000-0000-0000-000000000001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up database

```bash
# Push schema to database
npm run db:push

# Seed with default clinic data and services
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Role-Based Access

| Role | Access |
|------|--------|
| `PATIENT` | `/book`, `/patient/dashboard`, `/queue`, `/ticket` |
| `ADMIN` / `OWNER` | All admin routes at `/admin/*` |
| `DOCTOR` | All admin routes at `/admin/*` |
| `RECEPTIONIST` | All admin routes at `/admin/*` |

### Setting a user as Admin

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Find the user → **Public metadata**
3. Set: `{ "role": "ADMIN" }`
4. The user will get admin access on next sign-in

Alternatively, update the database directly:
```sql
UPDATE auth_users SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
```

---

## User Flows

### New Patient
1. Visit `/` → Click **"Yes, Create Account"**
2. Sign up at `/sign-up` (email OTP or Google)
3. Complete profile at `/patient/profile`
4. Book appointment at `/book`
5. View ticket at `/ticket/[id]`
6. Track queue at `/queue/[id]`

### Existing Patient
1. Visit `/` → Click **"No, Existing Patient"**
2. Sign in at `/sign-in`
3. Redirected to `/patient/dashboard`
4. Book new appointment at `/book`

### Admin
1. Sign in at `/sign-in`
2. Automatically redirected to `/admin` (if admin role)
3. Access full clinic management dashboard

---

## Database Scripts

```bash
npm run db:push       # Push schema changes
npm run db:seed       # Seed default data
npm run db:migrate    # Run migrations (production)
npm run db:health     # Check database connection
```

---

## Production Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy

The `npm run build` script automatically runs `prisma generate` before building.

---

## Architecture

```
app/
├── (public pages)
│   ├── page.jsx              # Homepage
│   ├── services/             # Clinic services
│   ├── contact/              # Contact info
│   ├── sign-in/              # Clerk SignIn component
│   ├── sign-up/              # Clerk SignUp component
│   ├── queue/[id]/           # Patient live queue
│   └── ticket/[id]/          # Appointment ticket
├── admin/
│   ├── (protected)/          # Admin routes (role-gated)
│   │   ├── page.jsx          # Dashboard
│   │   ├── appointments/     # Appointment management
│   │   ├── queue/            # Live queue control
│   │   ├── walk-ins/         # Walk-in booking
│   │   ├── patients/         # Patient database
│   │   ├── follow-ups/       # Follow-up management
│   │   ├── analytics/        # Analytics charts
│   │   └── settings/         # Clinic settings
│   └── login/                # Redirects to /sign-in
├── patient/
│   ├── dashboard/            # Patient dashboard
│   └── profile/              # Profile completion
├── book/                     # Booking flow
└── api/
    └── queue/stream/         # SSE real-time queue stream

components/
├── AdminFrame.jsx            # Admin sidebar layout
├── AdminQueueLive.jsx        # Live queue with SSE
├── BookingFlow.jsx           # Multi-step booking wizard
├── QueueLive.jsx             # Patient queue display
├── AuthControls.jsx          # Clerk auth UI
├── PatientProfileForm.jsx    # Profile form
└── Charts.jsx                # Recharts analytics

lib/
├── auth.js                   # Clerk + DB user sync
├── data.js                   # All DB queries
├── prisma.js                 # Prisma client singleton
├── queue-events.js           # PostgreSQL LISTEN/NOTIFY
├── time.js                   # Date/time utilities
├── validation.js             # Input validation
└── whatsapp.js               # WhatsApp message templates

app/actions.js                # All server actions
proxy.js                      # Clerk middleware (Next.js 16)
prisma/schema.prisma          # Database schema
```
