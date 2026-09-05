# Ethereal Web Agency — Next.js site + admin panel (Firebase-backed)

## Getting started

1. Create a project at https://console.firebase.google.com (free Spark plan is fine).
2. Enable **Firestore Database** (Build → Firestore Database → Create database,
   start in production mode — the rules below lock it down anyway).
3. Get a service account key: **Project Settings (gear icon) → Service
   accounts → Generate new private key**. This downloads a JSON file with
   `project_id`, `client_email`, and `private_key`.
4. Copy `.env.local.example` to `.env.local` and fill in:
   - `ADMIN_PASSWORD` and `SESSION_SECRET` (see comments in the file)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
     from the downloaded JSON file
5. (Optional but recommended) In Firebase Console → Firestore Database →
   Rules, paste in the contents of `firestore.rules` and publish. The app
   only ever talks to Firestore from the server via the Admin SDK, which
   bypasses these rules — they just block any stray client-side access.
6. Seed the starting prices:
   ```bash
   npm install
   node --env-file=.env.local scripts/seed-firebase.js
   ```
7. Run the app:
   ```bash
   npm run dev
   ```

Open http://localhost:3000 for the site, and http://localhost:3000/admin for
the admin panel (you'll be redirected to `/admin/login` first).

## Why Firebase (over a local file, or Supabase's free tier)

Prices used to live in a local `data/pricing.json` file, which only works if
the app runs on a server with a persistent, writable filesystem — it breaks
on serverless hosts like Vercel, where the filesystem resets on every
request. A Supabase free-tier project was considered too, but it **auto-pauses
after 7 days of inactivity** and has to be manually restored from the
dashboard — not great for a site that might go quiet over a slow week.
Firestore's free (Spark) tier has no such inactivity pause — it only has
usage quotas, so the site keeps working even after long gaps with no visits.

## Admin panel

- Login is restricted to a single email, set in `.env.local` as `ADMIN_EMAIL`
  (defaults to `ah2797764@gmail.com`). Password is `ADMIN_PASSWORD` in the
  same file — **change it before putting this online**. This part is a
  simple custom email+password check, independent of Firebase.
- Once logged in, use the two filter rows (service → plan type) plus the
  plan-tier row (Starter/Business/Advanced) to pick exactly which pricing
  card you want to edit, the same way visitors filter on the public site.
- You can edit the plan name, price, "was" price, the "Most Booked" flag,
  and every feature line (add, remove, or reword any bullet — e.g. add an
  "SEO audit" line or delete a "revisions" line).
- "Save changes" writes straight to Firestore, and the public pricing
  section picks it up on next load — no redeploy needed.
- Session login lasts 7 days and is stored in a signed, http-only cookie
  (`lib/auth.js`).

## Where things live

- `app/layout.js` — root layout, fonts, page metadata
- `app/page.js` — the public site (hero, services, process, pricing, about, contact, WhatsApp button)
- `app/PlanExplorer.js` — the public filterable pricing cards (fetches `/api/pricing`)
- `app/admin/login/page.js` — admin login screen
- `app/admin/AdminDashboard.js` — the admin editor (filters + form + live preview)
- `app/api/pricing/route.js` — GET (public) / PUT (login required), backed by Firestore
- `app/api/auth/login`, `app/api/auth/logout` — session cookie endpoints
- `middleware.js` — redirects unauthenticated visitors away from `/admin/*`
- `lib/auth.js` — email/password check + signed session cookie helpers
- `lib/firebaseAdmin.js` — server-only Firestore client (service account)
- `firestore.rules` — locks Firestore to server-only (Admin SDK) access
- `scripts/seed-firebase.js` — one-time script to push `data/pricing.json` into Firestore
- `data/pricing.json` — the starting prices/features, used only for seeding (the live site reads from Firestore, not this file, once seeded)
- `app/globals.css` — all styling, including the admin panel
- `public/images/` — logo, leather background photo, brown leather accent texture

## Notes

- The Firebase service account key gives full admin access to your Firestore
  data — it must never be exposed to the browser. It's only used inside
  `app/api/*` route handlers, which run on the server. Don't prefix any of
  the `FIREBASE_*` variables with `NEXT_PUBLIC_`.
- The contact form is still a front-end-only demo (`app/page.js`,
  `handleSubmit`). Wire it to Salesforce Web-to-Lead or an API route when ready.
- The WhatsApp number is set in two places in `app/page.js` — search for
  `923403157876` if you need to change it.
- If you ever want to hand-edit prices without opening `/admin`, you can do
  it directly in Firebase Console → Firestore Database → `config` collection
  → `pricing` document.
