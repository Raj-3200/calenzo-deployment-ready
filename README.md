# Calenzo

Calenzo is a premium clinic operations platform for appointment booking, patient profiles, live queue tracking, walk-ins, follow-ups, WhatsApp-ready communication, analytics, and AI-assisted booking.

## Tech Stack

- Next.js 16 App Router, React 19
- Tailwind CSS, Framer Motion, Lucide React, Recharts
- Prisma ORM with PostgreSQL or Neon PostgreSQL
- Clerk for patient authentication
- Local Prisma-backed admin password session for clinic staff
- PostgreSQL LISTEN/NOTIFY plus SSE with polling fallback for queue updates
- Gemini API for the server-side AI assistant

## Features

- Patient sign-up/sign-in with Clerk
- Patient profile creation, persistence, and edit flow
- Existing patient profile recovery by Clerk user and email
- Real slot generation with appointment duration, lunch break, and duplicate prevention
- Real appointment, token, queue item, notification, and audit writes
- Patient ticket and live queue pages
- Local admin dashboard, queue controls, walk-ins, appointments, patients, follow-ups, services, notifications, analytics, and settings
- WhatsApp quick links from appointment, ticket, notification, and follow-up flows
- AI assistant with English, Hindi, and Marathi language selection
- Server-side Gemini integration through `/api/ai/chat`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values:

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/patient/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/patient/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/patient/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/patient/profile
CLERK_WEBHOOK_SIGNING_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
DEFAULT_CLINIC_ID=00000000-0000-0000-0000-000000000001

ADMIN_EMAIL=admin@calenzo.health
ADMIN_PASSWORD=Admin1234!
ADMIN_ROLE=OWNER
ADMIN_SESSION_SECRET=

GEMINI_API_KEY=
```

Do not expose `CLERK_SECRET_KEY`, `ADMIN_SESSION_SECRET`, or `GEMINI_API_KEY` to the browser.

## Local Setup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Admin Setup

Admin sign-in is intentionally local DB/password based at `/admin/login`.

Default seeded credentials:

```text
User: admin@calenzo.health
Password: Admin1234!
```

Create or reset an admin:

```bash
npm run admin:create -- --email admin@calenzo.health --password "Admin1234!" --role OWNER
```

Supported admin roles are `OWNER`, `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `STAFF`.

Set `ADMIN_SESSION_SECRET` to a long random value in production so admin session cookies can be signed securely.

## Clerk Setup

Patient auth uses Clerk. Configure these in Clerk and Vercel:

- Sign-in URL: `/patient/login`
- Sign-up URL: `/patient/register`
- After sign-in URL: `/patient/dashboard`
- After sign-up URL: `/patient/profile`

Create a Clerk webhook pointing to:

```text
https://your-domain.com/api/webhooks/clerk
```

Listen for `user.created`, `user.updated`, and `user.deleted`.

## Gemini Setup

Set `GEMINI_API_KEY` in `.env.local` and in Vercel environment variables. The AI assistant route never sends this key to the client. If Gemini is unavailable, the assistant falls back to the normal booking flow message.

## Production Checks

```bash
npm run lint
npm run build
npm run db:push
npm run db:seed
```

If `prisma generate` fails locally on Windows with an `EPERM rename` against `query_engine-windows.dll.node`, stop any running `next dev` or Node process that is holding Prisma's engine DLL, then rerun the command.

## Vercel Deployment

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add every required environment variable.
4. Use the default build command from `vercel.json`: `prisma generate && next build`.
5. Run `npm run db:push` and `npm run db:seed` against the production database before first use.
6. Configure the Clerk webhook for the deployed domain.

## Troubleshooting

- Unauthenticated patient route redirects to `/patient/login`.
- Missing patient profile redirects to `/patient/profile`.
- Existing profiles are recovered by Clerk user id first, then by signed-in email.
- Patient users cannot access admin pages.
- Admin pages require the local `calenzo_admin_session` cookie.
- Queue pages use SSE and also refresh periodically.
