# DentCare

Full-stack dental clinic web app — public marketing site plus an admin dashboard for managing patients, appointments, staff, and clinics. Built with Next.js (App Router), Prisma, and PostgreSQL.

**Live preview:** [dentcare-eight.vercel.app](https://dentcare-eight.vercel.app)

## Tech stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL via Prisma ORM (`@prisma/adapter-pg`)
- NextAuth v5 (Credentials provider)
- Tailwind CSS v4 + shadcn/ui
- React Hook Form + Zod
- TanStack Query v5
- date-fns, Sonner (toasts), Lucide icons

## Where things are

| Route | What it is |
|---|---|
| `/` | Public marketing site (services, testimonials, doctor profile, contact) |
| `/admin/login` | Login for clinic staff **and** the super admin (same form, role decides where you land) |
| `/admin/dashboard` | Admin dashboard home (after login, for `ADMIN` / `DENTIST` / `ASSISTANT`) |
| `/super-admin` | Clinic management panel (after login, for the super admin only — see below) |

## Prerequisites

- Node.js 20+
- A PostgreSQL server reachable locally (a plain local install, or Docker — either works, `db:create` just needs a connection)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

This project uses **two** env files, and it matters which one you put things in:

- **`.env.local`** — read by Next.js itself (`next dev` / `next build`) and by everything the running app touches at request time. This is where your **local** `DATABASE_URL` goes.
- **`.env`** — only meaningful for things that explicitly load it (Vercel injects its own dashboard env vars directly and doesn't need this file; the Prisma CLI does **not** auto-load it either — see the note below). In this repo it's mainly used to keep a copy of the production connection strings for reference / for the one-off commands described further down.

Copy the example and fill it in:

```bash
cp .env.example .env.local
```

Required variables:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dentcare"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Super admin — logs in via /admin/login like everyone else, but isn't a DB row.
# Manages clinics at /super-admin and has no access to patient data.
SUPER_ADMIN_EMAIL="owner@dentcare.me"
SUPER_ADMIN_PASSWORD="pick-something-strong"
```

> **Prisma CLI note:** `prisma.config.ts` reads `process.env.DIRECT_URL` (falling back to a hardcoded local default) for CLI commands like `migrate`/`db seed`/`studio` — deliberately **not** `DATABASE_URL` — so that a bare `npm run db:reset` can never accidentally hit a production database just because a `.env` file happens to have one sitting in it. To run a CLI command against a real (e.g. Neon) database on purpose, pass the connection string inline for that one command:
> ```bash
> DIRECT_URL="<connection string>" npm run db:seed
> ```
> If that target is Neon, use the **direct** (non-pooled, no `-pooler` in the hostname) connection string, not the pooled one — Neon's pooled endpoint breaks Prisma Migrate's advisory-lock mechanism (`P1002` errors).

### 3. Database

One-time setup — creates the database, runs migrations, seeds an admin user:

```bash
npm run db:setup
```

After it finishes, log in at `/admin/login` with:

- **Email:** `admin@dentcare.me`
- **Password:** `test123`

> Change this password after first login — `seed.ts` always upserts this exact user, so re-seeding won't remove a changed password unless you also change the seed script.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, or go straight to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the dashboard — or skip local setup entirely and try the live deployment at [dentcare-eight.vercel.app](https://dentcare-eight.vercel.app).

## Database scripts

| Command | What it does |
|---|---|
| `npm run db:setup` | First-time setup: create DB → migrate → seed |
| `npm run db:migrate` | Create + apply a new migration from schema changes (`prisma migrate dev`) |
| `npm run db:seed` | Re-run the seed script (idempotent — safe to run again) |
| `npm run db:reset` | **Wipes the target database completely**, re-migrates, reseeds |
| `npm run db:studio` | Opens Prisma Studio (visual DB browser) at `localhost:5555` |

All of the above default to your **local** database unless you explicitly override `DIRECT_URL` inline, per the note above.

## Testing / verifying changes

There's no automated test suite in this project yet — verification is manual. Before considering a change done:

1. **Typecheck:**
   ```bash
   npx tsc --noEmit
   ```
2. **Click through the affected flow in the browser** — `npm run dev` (or use the live deployment), then actually exercise the feature. Type checking proves the code compiles, not that the feature works.
3. **Check both roles that matter for the change** — most admin features behave differently for `ADMIN` vs `DENTIST` vs `ASSISTANT` (see `lib/permissions.ts` / `lib/clinic-scope.ts`), so a fix that works for one role can silently be wrong for another.

## Testing flows

Concrete walkthroughs for the main features, and what each is supposed to do.

### Auth & roles

There are four roles, and they don't all work the same way:

- **`ADMIN`** — full access, and the only role that can switch between clinics (see Multi-clinic below).
- **`DENTIST`** — scoped to their own clinic; can see patients they're treating *or* registered themselves.
- **`ASSISTANT`** — scoped to their own clinic; more limited (see `assistantRestrictions` on the clinic — financials/diagnosis/notes/JMBG can be hidden per clinic).
- **Super admin** — not a database row at all. Logs in at `/admin/login` with `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` from your env file, gets routed to `/super-admin` instead of `/admin/dashboard`, and can only manage clinics — no patient/appointment data access.

**Flow:** log in as the seeded admin (`admin@dentcare.me` / `test123`) → go to **Podešavanja** (`/admin/settings`) → add one `DENTIST` and one `ASSISTANT` user → log out, log back in as each → confirm the sidebar/available pages differ and that data stays scoped to their clinic.

### Patients

**Flow:**
1. `/admin/patients/new` → try submitting with an invalid JMBG (wrong checksum) → should get a validation error inline, not a server round-trip. A known-valid test JMBG: `0101990820059`.
2. Create a patient with a duplicate JMBG → should get a friendly "already in use" error, not a raw 500.
3. On `/admin/patients`, search by partial name, phone, or JMBG (min. 4 digits) — debounced, no submit button. Try a two-word search like "Marko N" to confirm first+last name matching works.
4. **Hidden patients:** create a patient with a name starting with `#` (e.g. `#Test Pacijent`) → confirm it does **not** appear in the default list, but does show up if your search term also starts with `#`.
5. Open a patient's detail page → confirm the tooth chart and treatment history both render, and that only `SCHEDULED` (not past/completed) appointments show in "Zakazani termini".

### Appointments

**Flow:**
1. `/admin/appointments/new` → search and pick a patient, pick a dentist (as `ASSISTANT`, confirm the first available dentist is pre-selected rather than blank), pick a date, pick a duration, then confirm the time-slot grid updates and already-booked slots are visibly disabled.
2. Try to submit without picking a time slot → should block with a validation message, not silently fail.
3. On `/admin/appointments`, filter by date/status/dentist and confirm the list updates; mark one appointment as completed and one as cancelled from the list directly.

### Tooth chart & treatments

**Flow:** from a patient's detail page:
- **Plain click** on a tooth → filters the treatment table below to just that tooth (click it again to clear the filter).
- **Right-click** (or long-press on touch) on a tooth → opens a small menu to explicitly set its condition (**OK / Karijes / Nedostaje / Krunica / Implantat**), each with its own color — confirm the change persists on refresh.
- Add a treatment via "Dodaj tretman", tie it to a couple of teeth, then click one of those teeth on the chart and confirm the treatment table filters down to just that tooth.

### Multi-clinic (as `ADMIN` / super admin)

**Flow:**
1. As the super admin, create a second clinic at `/super-admin`.
2. Log in as `ADMIN` → use the clinic switcher in the header to pick "Sve klinike" (all clinics) vs a single clinic → confirm patients/appointments/staff lists change accordingly, and that the staff table only shows a "Klinika" column when viewing all clinics at once (single-clinic view hides it since it'd be redundant).
3. Confirm a non-`ADMIN` role never sees the clinic switcher at all.

### Mobile responsiveness

At a narrow viewport (375–390px): admin nav should collapse to a bottom tab bar, every data table should render as stacked cards instead, and the tooth chart should stay fully visible without horizontal scrolling.

## Deploying (Vercel + Neon)

- Set `DATABASE_URL` in the Vercel project's environment variables to Neon's **pooled** connection string (the one with `-pooler` in the hostname) — this is what the running app uses at request time via `lib/prisma.ts`, and pooling is exactly what you want for serverless.
- Also set `DIRECT_URL` to Neon's **direct** (non-pooled) connection string. This is what `prisma migrate deploy` uses during the build step (`package.json`'s `build` script runs `prisma migrate deploy && next build` automatically on every deploy) — without it, the build falls back to the local default and fails on Vercel's build machine.
- Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your production URL), and `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` too.
- Migrations run automatically on every deploy. Seeding is a manual one-off — see the `DIRECT_URL="..." npm run db:seed` pattern above.
