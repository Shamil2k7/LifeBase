# Lifebase — Personal Life Manager

A full-stack personal life management app: trips, todos, events, an encrypted
password vault, documents, and an expense tracker — built with **Next.js 14
(App Router)**, **MongoDB / Mongoose**, and **NextAuth**.

## Stack

- **Next.js 14** (App Router, Route Handlers for the API)
- **MongoDB** via **Mongoose**
- **NextAuth** (credentials login, JWT sessions)
- **Tailwind CSS** for styling, **Recharts** for the expense charts, **lucide-react** for icons
- Password vault entries are encrypted at rest with **AES-256-GCM**; unlocking
  the vault issues a short-lived, HMAC-signed cookie (auto-locks after 15 minutes)
- Document uploads are saved to `public/uploads/<userId>/` on the server

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | What it's for |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string (local Mongo or a free MongoDB Atlas cluster) |
| `NEXTAUTH_SECRET` | Random long string — used to sign session and vault tokens. Generate one with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `VAULT_ENCRYPTION_KEY` | Random long string — used to encrypt/decrypt vault password entries at rest |
| `SEED_*` | Only used by the seed script below |

## 3. Create your account

Either:

- **Register in the browser** once the app is running, at `/register` (this also
  sets your vault master password), **or**
- **Run the seed script** to create a demo account with sample trips/todos/events:

```bash
npm run seed
```

This creates a user with the email/password/master-password from `.env.local`
(defaults: `arjun.menon@gmail.com` / `password123`, vault master password `1234`).

## 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

## Project structure

```
app/
  (app)/            All signed-in pages (dashboard, trips, todos, events,
                     expenses, documents, vault, settings) + shared shell layout
  api/               Route handlers — one REST-ish API per module
  login, register/   Auth pages
components/
  ui/                Shared primitives (Card, Button, Modal, Field, Badge, …)
  layout/            Sidebar, bottom nav, top bar (search + notifications)
lib/                  dbConnect, authOptions, crypto (vault encryption),
                      vaultSession (vault unlock cookie), fetcher/useData (SWR)
models/               Mongoose schemas
scripts/seed.mjs      One-off script to create a demo user + sample data
```

## Notes & things to harden before shipping this for real

- **Registration is open** (`/api/register`) — fine for a personal/demo app,
  but you'll likely want to disable or protect it once your account exists.
- **Google Drive** integration on the Documents page is a UI toggle only —
  wiring up real OAuth + the Drive API is a natural next step.
- **Document files** are stored on local disk under `public/uploads/` — swap
  this for S3 / Cloudinary / a real Drive upload before deploying anywhere
  with an ephemeral filesystem (e.g. most serverless hosts).
- **Vault auto-lock** is 15 minutes of inactivity (`lib/vaultSession.js`) —
  adjust `TTL_MS` if you want it shorter/longer.
- Notification "reminders" (2 days before an event, etc.) are computed
  client-side from your data and shown in the app + as real browser
  notifications if you grant permission on the Events page. There's no
  background job / push service — that would need a scheduler (e.g. a cron
  job hitting a `/api/notifications/check` route, or a queue).
