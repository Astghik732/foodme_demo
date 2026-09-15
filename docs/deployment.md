# Deploy your own FoodMe (student guide)

**Time:** about 10 minutes · **Skill:** copy-paste · **Cost:** free · **No credit card**

Each student deploys **their own** copy. You only need a browser and a GitHub
account. No Docker on your laptop.

Everything runs on **one platform — Render** — from a single blueprint file
(`render.yaml`) already in the repo. You do **not** need Neon or Vercel
anymore, and you type **no** environment variables: the database, the API, and
both websites are wired together for you automatically.

When finished you get three links:

| What | Looks like |
|---|---|
| Customer website | `https://foodme-web-XXXX.onrender.com` |
| Admin back office | `https://foodme-admin-XXXX.onrender.com` |
| API (used by the apps) | `https://foodme-backend-XXXX.onrender.com` |

Admin login after deploy: **`admin` / `admin123`**

> Course lab only. Do not put real personal data in this app.

---

## Before you start

Create **two** free accounts (Google/GitHub login is fine):

1. [GitHub](https://github.com) — then **fork this course repo** to your account
2. [Render](https://render.com) — free hosting, no credit card

That's it. No Neon, no Vercel.

---

## Deploy (one blueprint) ≈ 8 minutes

1. **Fork** the FoodMe repo to your own GitHub account (top-right **Fork**
   button on the repo page).
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** →
   **Blueprint**. (Or click the **Deploy to Render** button in the repo's
   `README.md`.)
3. **Connect GitHub** and pick **your fork** of the FoodMe repo.
4. Render reads `render.yaml` and shows **four** resources it will create:

   | Resource | What it is |
   |---|---|
   | `foodme-db` | PostgreSQL database |
   | `foodme-backend` | the API (Docker) |
   | `foodme-web` | the customer website |
   | `foodme-admin` | the admin back office |

5. Click **Apply**. **You do not type any environment variables** —
   `DATABASE_URL` and the API address are filled in for you.
6. Wait until all four show **Live** / **Deployed**. The first build takes
   about **5–10 minutes** (the backend Docker image is the slow part).

---

## Verify it worked

Find each service's URL in the Render dashboard (open the service → the URL is
near the top).

**Automatic check** — from a terminal (or the Render service **Shell** tab):

```bash
scripts/verify-deploy.sh https://foodme-backend-XXXX.onrender.com
```

You want two `PASS` lines and `All checks passed ✅`.

**Manual check** — in a browser:

- [ ] Open `<API_URL>/actuator/health` → you want `{"status":"UP"}`
  - If it spins for a while: free Render is waking up — wait ~60s and refresh.
- [ ] Open the **customer website** URL → it shows chefs
- [ ] Click a chef → open a dish → **Add to cart** → checkout with a fake
      name/phone → see **Order placed!**
- [ ] Open the **admin** URL → login `admin` / `admin123` → Orders → your
      order is listed

**Expected quirk:** the chef list may show **5** chefs even though there are 6
in the database. That is an intentional bug for the course — not a deploy
failure.

---

## Good to know (free-tier limits)

| Thing | What happens |
|---|---|
| Idle sleep | Free services sleep after ~15 min idle; the **first** request then takes ~50s to wake. Normal — just refresh. |
| Database lifespan | Free Postgres is **deleted ~30 days** after creation. Fine for this course — re-apply the blueprint if you come back later. |
| First build | 5–10 minutes the first time (Docker build). Later deploys are faster. |

---

## If something breaks

| Symptom | Fix |
|---|---|
| A service failed to build | Open it → **Logs** and read the first red error. Re-deploy after fixing your fork. |
| Health page never UP | Open `foodme-backend` → **Logs**; make sure `foodme-db` is Live first. |
| Website loads but no chefs / network errors | Open `foodme-web` (or `foodme-admin`) → **Logs**/**Events**; a redeploy usually fixes a transient first-build wiring. |
| First open after a break is very slow | Free services sleep; wait 30–60s and refresh. |
| Forgot admin password | Seeded default is always `admin` / `admin123` |

---

## Appendix A — Watch your logs with MCP

You can point your agent (e.g. Claude Code) at the **Render MCP server** and
ask it for your deployed app's logs and deploy status — the cloud counterpart
to the local Grafana-MCP monitoring exercise.

1. In Render: **Account Settings → API Keys** → create a key.
2. Set it in your shell: `export RENDER_API_KEY=rnd_...`
3. Add the `render` server from `qa/mcp/.mcp.json.example` to your `.mcp.json`.

Then ask, e.g. *"show me the last 50 log lines and the latest deploy status for
foodme-backend."* See `qa/mcp/README.md` (Render section) for details. Treat
the key as **read-only** for this exercise — it can also trigger deploys and
edit env, so don't share it.

---

## Appendix B — Optional: error tracking with Sentry

Errors are disabled by default (blank DSN = no-op). To turn them on:

1. Create a free project at [sentry.io](https://sentry.io) and copy its **DSN**.
2. In the Render dashboard set these env vars, then redeploy each service:

   | Service | Key | Value |
   |---|---|---|
   | `foodme-backend` | `SENTRY_DSN` | your DSN |
   | `foodme-web` | `VITE_SENTRY_DSN` | your DSN (use a separate Sentry project if you like) |
   | `foodme-admin` | `VITE_SENTRY_DSN` | your DSN |

Leave them blank to keep error tracking off.

---

## Tear down (end of course)

Render → **Blueprints** → delete the FoodMe blueprint (removes all four
resources), or delete each service and the database individually.

---

## Instructor note

Local Docker stack stays the primary classroom path (`docs/runbook.md`). This
cloud path is for students who need a personal URL (homework, remote demos).
Stack: **Render only** (DB + API + both frontends) from one `render.yaml`
blueprint. Spring Boot is unchanged; the frontends are served as Render static
sites.

`FOODME_CORS_ALLOWED_ORIGINS=*` in the blueprint is **intentional** — it is
reserved as a future CORS/misconfiguration lesson. Do not tighten it.
