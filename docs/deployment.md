# Deploy your own FoodMe (student guide)

**Time:** about 15–20 minutes · **Skill:** copy-paste · **Cost:** free

Each student deploys **their own** copy. You only need a browser and a GitHub
account. No Docker on your laptop.

When finished you get three links:

| What | Looks like |
|---|---|
| Customer website | `https://foodme-web-YOURNAME.vercel.app` |
| Admin back office | `https://foodme-admin-YOURNAME.vercel.app` |
| API (used by the apps) | `https://foodme-api-YOURNAME.onrender.com` |

Admin login after deploy: **`admin` / `admin123`**

> Course lab only. Do not put real personal data in this app.

---

## Before you start

Create free accounts (Google/GitHub login is fine):

1. [GitHub](https://github.com) — fork **this** course repo to your account
2. [Neon](https://neon.tech) — free database
3. [Render](https://render.com) — free API hosting
4. [Vercel](https://vercel.com) — free websites

Keep a notes app open. You will paste **two** values into it:

```
DATABASE_URL = (from Neon, step 1)
API_URL      = (from Render, step 2)
```

---

## Step 1 — Database (Neon) ≈ 3 minutes

1. Open [console.neon.tech](https://console.neon.tech) → **New Project**.
2. Name it `foodme` → create (default region is fine).
3. On the project page, find **Connection string**.
4. Choose **URI** (starts with `postgresql://…`).
5. Click **Copy**.
6. Paste into your notes as `DATABASE_URL=…`

Leave the database empty. FoodMe fills it automatically on first start.

---

## Step 2 — API (Render) ≈ 7 minutes

1. Open [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect **GitHub** → pick **your fork** of the FoodMe repo.
3. Fill the form exactly:

   | Field | What to type / pick |
   |---|---|
   | Name | `foodme-api-YOURNAME` (must be unique) |
   | Language / Runtime | **Docker** |
   | Branch | `main` |
   | Region | same area as Neon if you can |
   | Dockerfile path | `apps/backend/Dockerfile` |
   | Docker build context directory | `apps/backend` |
   | Instance type | **Free** |

4. Open **Environment** → **Add Environment Variable**. Add **exactly these two**:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | paste the Neon URI from your notes (full `postgresql://…` string) |
   | `FOODME_CORS_ALLOWED_ORIGINS` | `*` |

5. Click **Create Web Service** / **Deploy**.
6. Wait until the status is **Live** (first build can take 5–10 minutes).
7. At the top of the service page, copy the URL (`https://foodme-api-….onrender.com`).
8. Paste into your notes as `API_URL=…`
9. Quick check: open `API_URL/actuator/health` in a browser. You want `{"status":"UP"}`.
   - If it spins a long time: free Render is waking up — wait ~60 seconds and refresh.

---

## Step 3 — Customer website (Vercel) ≈ 4 minutes

1. Open [vercel.com/new](https://vercel.com/new) → import **the same GitHub fork**.
2. Before Deploy, open **Root Directory** → **Edit** → type `apps/web` → Continue.
3. Open **Environment Variables** → add:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | your `API_URL` from notes (no trailing `/`) |

4. Click **Deploy**. Wait for success.
5. Copy the website URL → that is your **storefront**.

---

## Step 4 — Admin website (Vercel) ≈ 4 minutes

1. [vercel.com/new](https://vercel.com/new) again → **same repo** (Vercel allows multiple projects).
2. Root Directory → `apps/admin`.
3. Same env var:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | same `API_URL` |

4. Deploy → copy the admin URL.
5. Open it → login **`admin` / `admin123`**.

---

## You’re done — 60-second check

- [ ] Storefront opens and shows chefs
- [ ] Click a chef → open a dish → **Add to cart**
- [ ] Checkout with any fake name/phone → see **Order placed!**
- [ ] Admin → Orders → your order is listed
- [ ] Share your three URLs with the instructor if asked

**Expected quirk:** the chef list may show **5** chefs even though there are 6
in the database. That is an intentional bug for the course — not a deploy
failure.

---

## If something breaks

| Symptom | Fix |
|---|---|
| Render build failed | Dockerfile path must be `apps/backend/Dockerfile` and context `apps/backend` |
| Health page never UP | Check `DATABASE_URL` is the full Neon URI; look at Render **Logs** for red errors |
| Website loads but no chefs / network errors | `VITE_API_BASE_URL` wrong → fix env on Vercel → **Redeploy** (Vite bakes the URL at build time) |
| First open after a break is very slow | Free Render sleeps; wait 30–60s and refresh |
| Forgot admin password | Seeded default is always `admin` / `admin123` |

---

## Tear down (end of course)

1. Vercel → delete both projects  
2. Render → delete the web service  
3. Neon → delete the project  

---

## Instructor note

Local Docker stack stays the primary classroom path
(`docs/runbook.md`). This cloud path is for students who need a personal URL
(homework, remote demos). Stack: **Neon + Render + Vercel** — Spring Boot is
unchanged; Vercel only hosts the two static frontends.
