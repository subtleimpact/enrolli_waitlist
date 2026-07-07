# Enrolli Waitlist

A minimal, standalone Vite + React site whose only page is the Enrolli waitlist.
It is intentionally separate from the main app so that `myenrolli.com` can show
the finished waitlist while the full product keeps iterating on its own Vercel
test project.

Signups are written to the `waitlist` table in Supabase
(project `gaeizutjylpsooirowrd`).

---

## What's in here

```
index.html              page shell + <title>
vite.config.js          Vite + React
package.json            dependencies
.env.example            the two variables you need (copy to .env locally)
src/main.jsx            renders the Waitlist page
src/Waitlist.jsx        the waitlist landing page
src/supabaseClient.js   Supabase client (reads env vars)
```

---

## Deploy checklist (in order)

### 1. Put this in its own GitHub repo
Create a **new** repository (e.g. `enrolli-waitlist`) — do not add these files to
your existing app repo. Upload everything in this folder.

### 2. Import the repo into Vercel as a NEW project
In Vercel: **Add New → Project → import the `enrolli-waitlist` repo.**
Vercel auto-detects Vite (build command `vite build`, output `dist`). Leave
defaults as-is.

### 3. Add the two environment variables
In the new Vercel project: **Settings → Environment Variables.** Add both, for
all environments (Production, Preview, Development):

| Name                     | Value                                            |
| ------------------------ | ------------------------------------------------ |
| `VITE_SUPABASE_URL`      | `https://gaeizutjylpsooirowrd.supabase.co`       |
| `VITE_SUPABASE_ANON_KEY` | your Supabase **anon / public** key              |

Get the anon key from **Supabase → Project Settings → API → Project API keys →
`anon` `public`.** (The anon key is safe to expose publicly; the table is
protected by Row Level Security.) After adding them, redeploy so the build picks
them up.

### 4. Attach the domain
In the new Vercel project: **Settings → Domains → add `myenrolli.com`**
(and `www.myenrolli.com`). Vercel will then show you the exact DNS records to
create. **Use the values Vercel shows you** — don't copy the examples below
literally; they can change.

### 5. Add the DNS records at Namecheap
> **IMPORTANT — protect your email.** Keep Namecheap as your DNS host. Only ADD
> the records Vercel asks for. Do **not** switch your nameservers to Vercel, and
> do **not** delete your existing `MX`, `SPF`/`TXT` records — those run your
> Microsoft 365 email, and removing them would break it.

In Namecheap: **Domain List → Manage → Advanced DNS.** Typically Vercel asks for:

- An **A record** on host `@` pointing to a Vercel IP (e.g. `76.76.21.21`).
- A **CNAME record** on host `www` pointing to `cname.vercel-dns.com`.

Add exactly what Vercel shows. Leave every existing MX / TXT record alone.

### 6. Wait for DNS + verify
DNS can take anywhere from a few minutes to a couple of hours. Vercel's Domains
page will flip to "Valid Configuration" once it sees the records, and issues the
HTTPS certificate automatically.

---

## The one real test
Open `https://myenrolli.com`, submit the form once, then check the `waitlist`
table in the Supabase dashboard for the new row. This is the only way to confirm
the public (anon) insert works — the Supabase SQL editor bypasses Row Level
Security, so it can't tell you whether the live form can write.

---

## Run locally (optional)
```
npm install
cp .env.example .env      # then paste your real anon key into .env
npm run dev
```
