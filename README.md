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
7. Seed the starting "What we build" service cards:
   ```bash
   node --env-file=.env.local scripts/seed-services-firebase.js
   ```
8. (Optional, for uploading custom icons from the admin panel) On
   https://cloudinary.com (free tier is fine), copy your **Cloud name**
   from the dashboard, then create an **unsigned** upload preset at
   Settings → Upload → Upload presets → Add upload preset (set "Signing
   Mode" to "Unsigned"). Put both into `.env.local`.
9. Run the app:
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
- A second tab in the admin panel, **"Services (What we build)"**, manages
  the 5 service cards on the homepage: add a new card, remove one, edit its
  title and description, and upload a custom icon image (PNG/JPG/SVG/WEBP/GIF,
  2MB max) — it uploads straight from the browser to Cloudinary (using your
  unsigned upload preset) and the returned link is stored as that card's
  icon. Without Cloudinary configured, everything else still works; only the
  icon upload button will show an error until you add the two
  `NEXT_PUBLIC_CLOUDINARY_*` keys.

## Where things live

- `app/layout.js` — root layout, fonts, page metadata
- `app/page.js` — the public site (hero, services, process, pricing, about, contact, WhatsApp button)
- `app/PlanExplorer.js` — the public filterable pricing cards (fetches `/api/pricing`)
- `app/ServicesGrid.js` — the public "What we build" cards (fetches `/api/services`)
- `app/admin/login/page.js` — admin login screen
- `app/admin/AdminDashboard.js` — the admin shell + Pricing Plans editor (filters + form + live preview)
- `app/admin/ServicesPanel.js` — the Services editor (title/description/icon upload, add/remove cards)
- `app/api/pricing/route.js` — GET (public) / PUT (login required), backed by Firestore
- `app/api/services/route.js` — GET (public) / PUT (login required), backed by Firestore
- `app/api/auth/login`, `app/api/auth/logout` — session cookie endpoints
- `middleware.js` — redirects unauthenticated visitors away from `/admin/*`
- `lib/auth.js` — email/password check + signed session cookie helpers
- `lib/firebaseAdmin.js` — server-only Firestore client (service account)
- `firestore.rules` — locks Firestore to server-only (Admin SDK) access
- `scripts/seed-firebase.js` — one-time script to push `data/pricing.json` into Firestore
- `scripts/seed-services-firebase.js` — one-time script to push `data/services.json` into Firestore
- `data/pricing.json`, `data/services.json` — starting content, used only for seeding (the live site reads from Firestore once seeded)
- `app/globals.css` — all styling, including the admin panel
- `public/images/` — logo, leather background photo, brown leather accent texture

## Notes

- The Firebase service account key gives full admin access to your Firestore
  data — it must never be exposed to the browser. It's only used inside
  `app/api/*` route handlers, which run on the server. Don't prefix any of
  the `FIREBASE_*` variables with `NEXT_PUBLIC_`.
- Cloudinary uploads go straight from the browser using the unsigned preset —
  that's safe by design as long as the preset itself restricts what can be
  uploaded (Cloudinary's dashboard lets you cap file size/format and lock the
  destination folder on the preset). Don't switch the preset to "Signed"
  without also moving the upload call to a server route with the API secret.
- The contact form is still a front-end-only demo (`app/page.js`,
  `handleSubmit`). Wire it to Salesforce Web-to-Lead or an API route when ready.
- The WhatsApp number is set in two places in `app/page.js` — search for
  `923403157876` if you need to change it.
- If you ever want to hand-edit prices without opening `/admin`, you can do
  it directly in Firebase Console → Firestore Database → `config` collection
  → `pricing` document.
