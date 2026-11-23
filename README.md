# CaseTrack UG

**Follow your Local Council case — from filing to decision.**

CaseTrack UG is a mobile-first civic-tech prototype built for **Hack4Justice 2026 (Uganda)**. It gives citizens and Local Council (LC) Court officers one shared, auditable record of a case: a unique tracking ID, a dated timeline, hearing dates and in-app notifications.

> **Important:** This is an independent hackathon prototype. It is **not** connected to the Judiciary, KCCA, the Ministry of Justice, or any official government system. It does not send SMS or email, give legal advice, or make decisions. All seeded people, places and cases are **synthetic demo data**.

---

## Contents

- [What the prototype does](#what-the-prototype-does)
- [Demo accounts](#demo-accounts)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Useful scripts](#useful-scripts)
- [API overview](#api-overview)
- [Security and access model](#security-and-access-model)
- [Data model and seed](#data-model-and-seed)
- [Deployment](#deployment)
  - [API on the VPS (Docker + Caddy)](#api-on-the-vps-docker--caddy)
  - [Frontend on Vercel](#frontend-on-vercel)
- [Limitations and honest scope](#limitations-and-honest-scope)

---

## What the prototype does

### Citizen

- Register and sign in with an email and password.
- Register a case: title, category, LC court, description and optional paper reference.
- Receive a unique tracking ID in the form `CTUG-YYYY-XXXXXX`.
- Browse and search their own cases, filtered by status.
- Open a case to see a chronological timeline, current status, next hearing date and officer notes.
- Receive in-app notifications whenever an assigned officer updates the case.
- Update their name and phone number, and sign out.

### Court officer

- Sign in with a provisioned officer account (public officer registration is disabled).
- See a dashboard limited to cases **explicitly assigned** to them.
- Update a case status through a controlled workflow, with an optional note.
- Schedule a hearing (date, time, title, description).
- Add a milestone or note to the case file.
- Review the full, attributed history of every assigned case.

Every timeline entry records the **author, role, source and timestamp**. Demo data is labelled **DEMO** throughout, and citizen-created records are labelled **CITIZEN REPORTED**.

---

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Court officer (demo) | `officer.demo@casetrack.ug` | `DemoOfficer2026!` |
| Citizen (demo) | `citizen.demo@casetrack.ug` | `DemoCitizen2026!` |

Both accounts are created by the seed script and clearly marked **DEMO** in the UI. The sign-in page has one-click buttons that fill these credentials. Public registration always creates a **citizen** account — there is no public way to create an officer account.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3.4, lucide-react |
| Backend | Node.js 20+, Express 4, TypeScript, Mongoose 8, Zod, bcryptjs, jsonwebtoken |
| Database | MongoDB (Atlas in production, local MongoDB for development) |
| Fonts | Inter + Fraunces via `next/font/google` |
| Infra | Docker Compose for the API, Caddy for HTTPS, Vercel for the frontend |

The repo is an npm workspaces monorepo:

```
api/   Express + Mongoose REST API
web/   Next.js App Router frontend
```

---

## Repository layout

```
casetrack-ug/
├── api/
│   ├── src/
│   │   ├── config.ts            # Env validation (Zod)
│   │   ├── db.ts                # Mongoose connection
│   │   ├── app.ts               # Express app, CORS, helmet, routes
│   │   ├── server.ts            # HTTP server bootstrap
│   │   ├── models/              # User, Institution, Case, CaseEvent, CaseAccess, Notification
│   │   ├── routes/              # auth, institutions, cases, notifications, health
│   │   ├── middleware/          # auth guard, RBAC, validation, rate limit, errors
│   │   ├── lib/                 # serializers, ids, pagination
│   │   ├── scripts/assign.ts    # Assign an officer to cases
│   │   └── seed.ts              # Destructive demo seed
│   ├── Dockerfile
│   └── .env.example
├── web/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── login/, register/
│   │   └── (app)/               # Authenticated shell: dashboard, cases, notifications, profile
│   ├── components/              # AppShell, Timeline, OfficerActions, UI primitives
│   ├── lib/                     # API client, auth context, types, constants, formatters
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Local development

### Prerequisites

- Node.js **20+** (22 recommended)
- npm 10+
- A MongoDB instance — either local (`mongodb://127.0.0.1:27017/casetrack_ug`) or a MongoDB Atlas cluster

### 1. Install dependencies

From the repo root:

```bash
npm install
```

This installs both workspaces.

### 2. Configure the API

```bash
cp api/.env.example api/.env
```

Edit `api/.env` and at minimum set `MONGODB_URI` and `JWT_SECRET`:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/casetrack_ug
JWT_SECRET=local-dev-secret-casetrack-ug-0123456789abcdef
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000
TRUST_PROXY=0
```

Generate a strong secret for anything other than local use:

```bash
openssl rand -base64 48
```

### 3. Seed demo data

The seed is **destructive**: it clears the CaseTrack collections and recreates the demo dataset.

```bash
npm run seed
```

Expected result:

```
Seed complete — all records are synthetic DEMO data.
{
  users: 2,
  institutions: 10,
  cases: 8,
  events: 30,
  notifications: 7,
  caseAccess: 8
}
```

In production, the seed refuses to run unless `SEED_FORCE=true` is also set. Do not run it against a database holding data you care about.

### 4. Configure the frontend

```bash
cp web/.env.example web/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Run both apps

In two terminals:

```bash
npm run dev:api     # http://localhost:4000
npm run dev:web     # http://localhost:3000
```

Check the API:

```bash
curl http://localhost:4000/api/health
```

Then open <http://localhost:3000> and use the demo buttons on the sign-in page.

---

## Environment variables

### `api/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | no | `development`, `test` or `production`. Default `development`. |
| `PORT` | no | HTTP port. Default `4000`. |
| `MONGODB_URI` | **yes** | MongoDB connection string. |
| `JWT_SECRET` | **yes** | At least 32 characters. Used to sign bearer tokens. |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d`. |
| `CORS_ORIGINS` | no | Comma-separated browser origins. No wildcards. |
| `TRUST_PROXY` | no | Number of reverse proxies in front of the API. `1` behind Caddy, `0` locally. |

### `web/.env.local`

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | **yes** in production | Public base URL of the API, no trailing slash. Defaults to `http://localhost:4000`. |

> `NEXT_PUBLIC_*` values are compiled into the browser bundle. Never put secrets there.

---

## Useful scripts

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev:api` | Start the API with hot reload (`tsx watch`). |
| `npm run dev:web` | Start the Next.js dev server. |
| `npm run build` | Type-check and build both workspaces. |
| `npm run typecheck` | Type-check the API and the frontend. |
| `npm run seed` | Reset and reseed the demo dataset. |
| `npm run assign` | Assign an officer to cases (see `api/src/scripts/assign.ts`). |

---

## API overview

All responses use a consistent envelope:

```json
{ "data": { ... }, "meta": { ... } }
```

Errors look like:

```json
{ "error": { "message": "Human readable message", "code": "SOME_CODE", "details": [] } }
```

Authenticated requests use `Authorization: Bearer <jwt>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | public | Liveness/readiness probe. |
| `POST` | `/api/auth/register` | public | Create a **citizen** account and return a token. |
| `POST` | `/api/auth/login` | public | Exchange credentials for a token. |
| `GET` | `/api/auth/me` | authenticated | Current user profile. |
| `PATCH` | `/api/auth/me` | authenticated | Update name and phone. |
| `GET` | `/api/institutions` | authenticated | List LC courts (seeded). |
| `GET` | `/api/cases` | authenticated | List cases. Citizens see their own; officers see assigned cases. Supports `q`, `status`, `category`, `sort`, `page`, `limit`. |
| `GET` | `/api/cases/stats` | authenticated | Dashboard aggregates. |
| `POST` | `/api/cases` | citizen | Register a case and receive a tracking ID. |
| `GET` | `/api/cases/:id` | owner or assigned officer | Case detail. |
| `GET` | `/api/cases/:id/events` | owner or assigned officer | Chronological timeline. |
| `PATCH` | `/api/cases/:id/status` | assigned officer | Controlled status transition. |
| `POST` | `/api/cases/:id/events` | assigned officer | Add a hearing, milestone or note. |
| `GET` | `/api/notifications` | authenticated | List notifications. Supports `page`, `limit`, `unread`. |
| `PATCH` | `/api/notifications/:id/read` | owner | Mark one notification read. |
| `PATCH` | `/api/notifications/read-all` | owner | Mark all notifications read. |

### Case statuses

`REGISTERED` → `UNDER_REVIEW` → `HEARING_SCHEDULED` → `ADJOURNED` / `DECISION_RECORDED` → `CLOSED`

Only transitions permitted in the server's `ALLOWED_TRANSITIONS` map are accepted. `HEARING_SCHEDULED` is set through the dedicated schedule-hearing action (which requires a hearing date), not the generic status form.

---

## Security and access model

- **Passwords** are hashed with bcrypt; the hash is never serialized.
- **JWT bearer tokens** are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN`.
- **Citizens** can only read cases they created.
- **Officers** can only read or update cases with an explicit `CaseAccess` record for them. There is no implicit "see everything" officer role.
- **Public registration** always creates a `CITIZEN`; officer accounts must be provisioned by an administrator/seed.
- **Validation** is done with Zod on every mutating endpoint.
- **Rate limiting** is applied to the API; `helmet` sets standard security headers; CORS only allows configured origins.
- **Errors** are centralized and never leak stack traces in production.
- **MongoDB indexes** cover tracking IDs, case ownership, assignment and notification lookups.

### Session storage trade-off

The frontend stores the JWT in `localStorage` under `casetrack.token` and sends it as a bearer token. This was chosen because the frontend (Vercel) and API (`*.duckdns.org`) are different sites, which makes cross-site cookies brittle. The trade-off is that any XSS on the frontend could read the token, so this is a **prototype-grade** session model. A production system should use short-lived tokens with refresh rotation, or same-site cookies with CSRF protection.

---

## Data model and seed

Core collections:

- **User** — name, email, password hash, role (`CITIZEN` / `OFFICER`), phone, institution (officer), `isDemo`.
- **Institution** — LC court name, level (`LC_I`, `LC_II`, `LC_III`), district, subcounty, address, optional duty officer.
- **Case** — tracking ID, title, category, description, reference, status, owning citizen, institution, assigned officer, `nextHearingAt`, `lastEventAt`, `isDemo`.
- **CaseEvent** — type, title, description, optional status change and hearing date, author, source (`USER_REPORTED`, `OFFICER_UPDATE`, `DEMO`, `SYSTEM`), timestamp.
- **CaseAccess** — explicit officer-to-case assignment.
- **Notification** — recipient, case reference, title, body, read flag.

The seed creates 2 users, 10 LC courts across Ugandan districts, 8 synthetic cases spanning every status, 30 events, 7 notifications and 8 access records. All timestamps are anchored to plausible East Africa Time (EAT) office hours.

New citizen cases are automatically assigned to the selected court's duty officer, so the demo officer sees them immediately. This is a demo convenience, not a real allocator.

---

## Deployment

The intended production shape:

```
Browser ──HTTPS──> Vercel (Next.js frontend)
   │
   └──HTTPS──> Caddy on the VPS  ──> 127.0.0.1:4000 (Docker: casetrack-api)  ──> MongoDB Atlas
```

> The VPS may already run Caddy for other services (for example an Arkiv deployment). **Do not modify existing Caddy site blocks or other services.** Add only a new site block for `casetrackug.duckdns.org`, validate the config, and coordinate with the machine owner before reloading Caddy.

### API on the VPS (Docker + Caddy)

1. Copy the repo (or at least `docker-compose.yml`, `api/Dockerfile`, `api/` and `web/package.json`) to the VPS.
2. Create `api/.env` on the server:

   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/casetrack_ug?retryWrites=true&w=majority
   JWT_SECRET=<output of: openssl rand -base64 48>
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=https://your-frontend.vercel.app
   TRUST_PROXY=1
   ```

3. Build and start the container:

   ```bash
   docker compose build
   docker compose up -d
   docker compose ps
   curl -s http://127.0.0.1:4000/api/health
   ```

   The compose file publishes the API on `127.0.0.1:4000` only — it is not exposed directly to the internet.

4. Seed the demo data once (only against a throwaway/demo database):

   ```bash
   docker compose exec api node dist/seed.js
   ```

   `npm run seed` uses `tsx`; inside the runtime image use the compiled entry point above. The seed requires `SEED_FORCE=true` when `NODE_ENV=production`.

5. Add a Caddy site block (example):

   ```caddyfile
   casetrackug.duckdns.org {
       encode gzip zstd

       handle /api/* {
           reverse_proxy 127.0.0.1:4000
       }

       handle {
           respond "CaseTrack UG API" 200
       }
   }
   ```

   If the domain already exists in your Caddyfile, extend that block instead of adding a second one.

6. Validate and reload:

   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   curl -s https://casetrackug.duckdns.org/api/health
   ```

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set **Root Directory** to `web`.
3. Framework preset: **Next.js** (build `next build`, output handled automatically).
4. Add an environment variable:

   ```env
   NEXT_PUBLIC_API_URL=https://casetrackug.duckdns.org
   ```

5. Deploy.
6. Add the Vercel domain to the API's `CORS_ORIGINS` and restart the container:

   ```bash
   docker compose up -d --force-recreate api
   ```

7. Smoke-test from the deployed frontend: sign in with the demo citizen, open a case, then sign in as the demo officer and move a case through one status transition.

### Deploying without Docker (alternative)

```bash
npm ci
npm run build
NODE_ENV=production node api/dist/server.js
```

Run it under a process manager (systemd, pm2) bound to loopback, behind Caddy.

---

## Limitations and honest scope

This MVP is intentionally narrow. It does **not**:

- integrate with any official court, police, KCCA or Judiciary system;
- send SMS, email, WhatsApp or push notifications — updates are in-app only;
- accept payments, process documents, or verify identity;
- provide legal advice or record binding decisions;
- support password reset, email verification, or multi-factor authentication;
- include officer self-registration, case reassignment UI, or an admin console;
- guarantee the durability, confidentiality or evidentiary value of any record.

Additional known constraints:

- **Demo data is synthetic.** Seeded cases, names, locations and events are fabricated for demonstration.
- **Bearer tokens in `localStorage`.** See the trade-off above; fine for a prototype, not for production.
- **No real-time push.** The notification badge polls at a short interval rather than using websockets.
- **Single-region deployment.** No offline support, background jobs or queues.
- **Statuses are a presentation model.** Real LC court procedures vary by district and level; the workflow shown here is a simplification, not legal process guidance.

If this prototype were taken further, the first priorities would be: an official data-partnership and consent model, secure same-site session handling with refresh tokens, an admin/officer provisioning flow with audit logging, SMS/USSD fallback for low-connectivity users, and accessibility and local-language testing with real LC courts.

---

## Disclaimer

CaseTrack UG is an independent Hack4Justice 2026 prototype. It is not an official government service and must not be used to file, track or decide a real case. Do not enter real personal or case information.
