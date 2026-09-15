# One-click Render deploy + logs-via-MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a non-technical student deploy the whole FoodMe stack from one Render blueprint with zero hand-typed env values, and turn "get my logs" into a Render-MCP exercise.

**Architecture:** Expand the backend-only `render.yaml` into a full-stack blueprint (managed Postgres + Docker backend + two static React sites) whose env is self-wired via Render's `fromDatabase` / `fromService` references. A one-line scheme-normalization in each frontend's API client lets `fromService` (which yields a bare host) supply `VITE_API_BASE_URL` automatically. Docs collapse from four platforms to one; the Render MCP server is added to the course's MCP templates for a cloud logs exercise.

**Tech Stack:** Render Blueprint YAML, Spring Boot 3 (Docker), Vite/React static sites, bash + curl, MCP (`render-oss/render-mcp-server`).

**Spec:** `docs/superpowers/specs/2026-09-15-one-click-render-deploy-design.md`

## Global Constraints

- API contract is frozen — do not rename any `/api/**` or `/admin/**` path, request field, or response field (`docs/api-contract.md`).
- `FOODME_CORS_ALLOWED_ORIGINS=*` is an **intentional planted weakness** for a future lesson — set it to `*` and comment it as intentional; never "harden" it.
- Every credential in `qa/mcp/` is referenced as an env var, never a literal; `.mcp.json` (without `.example`) is never committed.
- Money/behavior code is out of scope — this change touches deploy config, two one-line frontend edits, docs, and one script only.
- Commit only when a task says to; work on `main` is fine for this repo per the user (no branch requested).

---

### Task 1: Normalize API base URL in both frontends

So `VITE_API_BASE_URL` can be a bare host (what Render `fromService` yields) or a full URL, and either works. Without this, the auto-wired value `foodme-backend-xxxx.onrender.com` would be treated as a relative path and every API call would 404.

**Files:**
- Modify: `apps/web/src/api/client.ts:3`
- Modify: `apps/admin/src/api/base-api.js:3`

**Interfaces:**
- Produces: an `API_BASE_URL` string that always starts with `http`, consumed by the existing axios/fetch clients unchanged.

- [ ] **Step 1: Edit `apps/web/src/api/client.ts`**

Replace line 3:

```ts
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
```

with:

```ts
const RAW_API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
// Render's blueprint `fromService` injects a bare host (no scheme); prepend https:// so it works.
const API_BASE_URL: string = /^https?:\/\//.test(RAW_API_BASE_URL) ? RAW_API_BASE_URL : `https://${RAW_API_BASE_URL}`;
```

- [ ] **Step 2: Edit `apps/admin/src/api/base-api.js`**

Replace line 3:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
```

with:

```js
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
// Render's blueprint `fromService` injects a bare host (no scheme); prepend https:// so it works.
const API_BASE_URL = /^https?:\/\//.test(RAW_API_BASE_URL) ? RAW_API_BASE_URL : `https://${RAW_API_BASE_URL}`;
```

- [ ] **Step 3: Verify both build**

Run: `cd apps/web && npm run build` then `cd ../admin && npm run build`
Expected: both builds succeed (tsc + vite for web, vite for admin), no type errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/api/client.ts apps/admin/src/api/base-api.js
git commit -m "feat: normalize VITE_API_BASE_URL so a bare host resolves to https"
```

---

### Task 2: Expand `render.yaml` into a full-stack, self-wired blueprint

**Files:**
- Modify: `render.yaml` (full rewrite)

**Interfaces:**
- Consumes: backend `DatabaseUrlEnvironmentPostProcessor` (accepts `DATABASE_URL=postgresql://…`), `apps/backend/Dockerfile`, frontend `VITE_API_BASE_URL` normalization from Task 1.
- Produces: four Render resources — `foodme-db`, `foodme-backend`, `foodme-web`, `foodme-admin`.

- [ ] **Step 1: Replace `render.yaml` entirely**

```yaml
# FoodMe — one-click Render Blueprint (course lab).
# New → Blueprint → pick your fork → Apply. No env values to type by hand:
# DATABASE_URL and VITE_API_BASE_URL are wired automatically below.
#
# Lab caveats (fine for an 8-session, tear-down course):
#   - Free Postgres is deleted ~30 days after creation.
#   - Free web services sleep when idle (~50s cold start on first request).
databases:
  - name: foodme-db
    plan: free
    databaseName: foodme
    user: foodme

services:
  # --- Backend API (Spring Boot, Docker) ---------------------------------
  - type: web
    name: foodme-backend
    runtime: docker
    plan: free
    dockerfilePath: ./apps/backend/Dockerfile
    dockerContext: ./apps/backend
    healthCheckPath: /actuator/health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: foodme-db
          property: connectionString
      # INTENTIONAL planted weakness — a future CORS/misconfiguration lesson
      # depends on this being wide open. Do NOT tighten it.
      - key: FOODME_CORS_ALLOWED_ORIGINS
        value: "*"
      # Optional error tracking — leave blank to disable (app no-ops).
      - key: SENTRY_DSN
        sync: false

  # --- Storefront (static React) -----------------------------------------
  - type: web
    name: foodme-web
    runtime: static
    buildCommand: cd apps/web && npm ci && npm run build
    staticPublishPath: apps/web/dist
    envVars:
      - key: VITE_API_BASE_URL
        fromService:
          type: web
          name: foodme-backend
          property: host
      - key: VITE_SENTRY_DSN
        sync: false
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

  # --- Admin back office (static React) ----------------------------------
  - type: web
    name: foodme-admin
    runtime: static
    buildCommand: cd apps/admin && npm ci && npm run build
    staticPublishPath: apps/admin/dist
    envVars:
      - key: VITE_API_BASE_URL
        fromService:
          type: web
          name: foodme-backend
          property: host
      - key: VITE_SENTRY_DSN
        sync: false
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

- [ ] **Step 2: Validate YAML parses**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('render.yaml')); print('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add render.yaml
git commit -m "feat: full-stack self-wired Render blueprint (db+backend+web+admin)"
```

---

### Task 3: `scripts/verify-deploy.sh` health-check helper

**Files:**
- Create: `scripts/verify-deploy.sh`

**Interfaces:**
- Usage: `scripts/verify-deploy.sh <API_BASE_URL>` (e.g. `https://foodme-api-xyz.onrender.com`). Optional 2nd arg web URL is only echoed, not curled.
- Produces: `PASS`/`FAIL` lines; exit 0 if all pass, 1 otherwise.

- [ ] **Step 1: Write the script**

```bash
#!/usr/bin/env bash
# Verify a deployed FoodMe API is live and serving data.
# Usage: scripts/verify-deploy.sh <API_BASE_URL> [WEB_URL]
set -u

API="${1:-}"
if [ -z "$API" ]; then
  echo "usage: $0 <API_BASE_URL> [WEB_URL]" >&2
  exit 2
fi
API="${API%/}"   # strip trailing slash

fail=0
check() {
  local name="$1" url="$2" expect="$3"
  local body code
  body="$(curl -sS -m 30 -w $'\n%{http_code}' "$url" 2>/dev/null)" || { echo "FAIL  $name — request error ($url)"; fail=1; return; }
  code="${body##*$'\n'}"
  body="${body%$'\n'*}"
  if [ "$code" = "200" ] && printf '%s' "$body" | grep -q "$expect"; then
    echo "PASS  $name"
  else
    echo "FAIL  $name — HTTP $code (expected 200 containing '$expect')"
    fail=1
  fi
}

echo "Checking $API ..."
check "health"     "$API/actuator/health" '"status":"UP"'
check "chefs list" "$API/api/chef/active" '['

if [ -n "${2:-}" ]; then
  echo "Storefront: ${2%/}"
fi

if [ "$fail" -eq 0 ]; then
  echo "All checks passed ✅"
else
  echo "Some checks failed ❌ — see docs/deployment.md troubleshooting." >&2
fi
exit "$fail"
```

- [ ] **Step 2: Make executable**

Run: `chmod +x scripts/verify-deploy.sh`

- [ ] **Step 3: Test against a bogus host (expect FAIL + non-zero exit)**

Run: `scripts/verify-deploy.sh https://nonexistent.invalid; echo "exit=$?"`
Expected: two `FAIL` lines and `exit=1`.

- [ ] **Step 4: Test against the local stack if reachable (expect PASS)**

Run: `scripts/verify-deploy.sh http://localhost:8081; echo "exit=$?"`
Expected (only if the local backend is up on 8081): two `PASS` lines and `exit=0`. If the backend is not running, skip — the bogus-host test already proves the failure path.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-deploy.sh
git commit -m "feat: add verify-deploy.sh deploy health-check helper"
```

---

### Task 4: Rewrite `docs/deployment.md` for the single-platform flow

**Files:**
- Modify: `docs/deployment.md` (full rewrite)

- [ ] **Step 1: Replace the document body**

Write a student-facing guide with these sections, in copy-paste tone (keep the existing warm, numbered style):

1. **Intro** — "Deploy your own FoodMe", ~10 min, browser only, free, **no credit card**. Result: three `*.onrender.com` URLs (web / admin / API). Admin login `admin` / `admin123`. Lab-only warning.
2. **Before you start** — two free accounts only: GitHub (fork this repo) and Render. Explicitly note Neon and Vercel are no longer needed.
3. **Deploy (one blueprint)** — steps: (a) fork the repo; (b) in Render click **New → Blueprint**, or use the **Deploy to Render** button in the README; (c) connect GitHub and pick your fork; (d) Render reads `render.yaml` and lists four resources — click **Apply**; (e) wait until all are **Live** (first build 5–10 min). Emphasize: **you type no environment variables — everything is wired for you.**
4. **Verify** — run `scripts/verify-deploy.sh <API_URL>` (locally, or from the Render shell), or manually open `<API_URL>/actuator/health` (want `{"status":"UP"}`) and open the web URL. Where to find each URL in the Render dashboard.
5. **Caveats** — free Postgres deleted after ~30 days; free services sleep (~50s cold start on first request). Both fine for the course.
6. **Appendix A — Watch your logs with MCP** — point to `qa/mcp/README.md` Render section; one paragraph: create a Render API key, set `RENDER_API_KEY`, then ask your agent for recent logs / last deploy status.
7. **Appendix B — Optional: error tracking with Sentry** — create a free hosted-Sentry project, copy the DSN, and in the Render dashboard set `SENTRY_DSN` on `foodme-backend` and `VITE_SENTRY_DSN` on `foodme-web` and `foodme-admin`, then redeploy. Blank = disabled.

Remove every reference to Neon and Vercel.

- [ ] **Step 2: Grep for leftover stale references**

Run: `grep -in "neon\|vercel" docs/deployment.md`
Expected: no matches (or only an explicit "you do NOT need Neon/Vercel" line).

- [ ] **Step 3: Commit**

```bash
git add docs/deployment.md
git commit -m "docs: rewrite deployment guide for single-platform Render blueprint"
```

---

### Task 5: Add the Render MCP server to the course MCP templates

**Files:**
- Modify: `qa/mcp/README.md`
- Modify or create: `qa/mcp/.mcp.json.example`

**Interfaces:**
- Produces: a `render` MCP entry authed by `RENDER_API_KEY` (env var, never literal).

- [ ] **Step 1: Confirm the current Render MCP transport**

Run: `# check the official server's current config form`
Fetch `https://render.com/docs/mcp-server` (WebFetch) and note whether the canonical setup is a hosted HTTP endpoint or a local `npx @render/mcp-server` / Docker command. Use whichever the docs currently show in Step 2. (As of writing: local via `npx`, auth `RENDER_API_KEY`.)

- [ ] **Step 2: Add a "Render" section to `qa/mcp/README.md`**

Insert after the Grafana section. Content:
- Official server: `render-oss/render-mcp-server`.
- Auth: `RENDER_API_KEY` from Render Dashboard → Account Settings → API Keys.
- What it exposes: services list/details, **logs**, deploy history/status, metrics, read-only Postgres queries.
- **Framing for students:** use it **read-only** — reading logs and deploy status. Note it is early-access and also includes write/destructive tools (deploys, env edits), so treat the key with care.
- The config block matching Step 1's transport, referencing `${RENDER_API_KEY}`.
- **Exercise:** "Ask your agent for your deployed app's recent logs and last deploy status via the Render MCP server — the cloud counterpart to the local Grafana-MCP monitoring exercise."

- [ ] **Step 3: Add the `render` entry to `qa/mcp/.mcp.json.example`**

If the file exists, add a `render` server key alongside the others; if not, create it consistent with the README's documented servers. Use the env-var reference form (`RENDER_API_KEY`), no literal secret.

- [ ] **Step 4: Add `RENDER_API_KEY` to the env-var table**

In `qa/mcp/README.md`'s bottom "Setting up your own `.mcp.json`" table, add a row: `RENDER_API_KEY` | Render MCP server.

- [ ] **Step 5: Validate the example JSON parses (if it is JSON)**

Run: `python3 -c "import json; json.load(open('qa/mcp/.mcp.json.example')); print('ok')"`
Expected: `ok` (skip if the file is intentionally a documented snippet, not standalone JSON).

- [ ] **Step 6: Commit**

```bash
git add qa/mcp/README.md qa/mcp/.mcp.json.example
git commit -m "docs: add Render MCP server for the cloud logs exercise"
```

---

### Task 6: Update the README cloud-deploy section + Deploy button

**Files:**
- Modify: `README.md` ("Cloud lab deploy" section)

- [ ] **Step 1: Rewrite the "Cloud lab deploy" section**

- Describe the single-platform Render flow (fork → Blueprint → Apply).
- Replace the "Neon + Render + Vercel" stack line with "Render (DB + API + both frontends), one blueprint".
- Add a **Deploy to Render** button linking to the blueprint deploy URL for this repo. Use the standard form, leaving the repo URL as the student's fork is chosen in Render's flow; document it as:

```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
```

- Keep the "lab-only, tear down after the course" warning.
- Point to `docs/deployment.md` for the click-by-click guide.

- [ ] **Step 2: Grep for stale references in README**

Run: `grep -in "neon\|vercel" README.md`
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: point README cloud deploy at single-platform Render blueprint"
```

---

## Self-Review

**Spec coverage:**
- Blueprint (spec §Architecture.1) → Task 2. ✓
- `deployment.md` rewrite (§2) → Task 4. ✓
- Render MCP logs (§3) → Task 5. ✓
- `verify-deploy.sh` (§4) → Task 3. ✓
- README update (§5) → Task 6. ✓
- Optional Sentry appendix → Task 4 Step 1 (Appendix B) + blueprint `SENTRY_DSN`/`VITE_SENTRY_DSN` sync:false in Task 2. ✓
- CORS intentional-weakness framing → Task 2 (inline comment) + Global Constraints. ✓
- The `fromService` bare-host risk (spec Risks) → resolved by Task 1 normalization. ✓

**Placeholder scan:** No TBD/TODO in steps; Task 5 Step 1 is a deliberate doc-confirmation action with a documented current-state fallback, not a placeholder. ✓

**Type consistency:** `RAW_API_BASE_URL`/`API_BASE_URL` names consistent across Task 1 web+admin edits; `foodme-db`/`foodme-backend`/`foodme-web`/`foodme-admin` names consistent between Task 2 blueprint and Task 4/6 docs; `RENDER_API_KEY` consistent across Task 5. ✓
