# One-click Render deploy + logs-via-MCP — design

**Date:** 2026-09-15
**Status:** Approved for implementation planning
**Scope:** Deployment scaffolding and observability onboarding for the FoodMe QA course.

## Problem

FoodMe is the System Under Test for an 8-session agentic-QA course. Each
student must deploy their own personal instance. The current flow
(`docs/deployment.md`) spreads deployment across **four** platforms —
GitHub fork, Neon (DB), Render (API), Vercel (web + admin) — and requires
students to hand-copy connection strings (`DATABASE_URL`, `API_URL`)
between dashboards. The students are not strong technicians, so the three
biggest failure sources are:

1. **Too many signups** — four separate SaaS accounts, each a place to get
   stuck (and some free tiers demand a card).
2. **Manual wiring** — copy-pasting `DATABASE_URL` / `API_URL` / CORS by
   hand; typos and wrong-field mistakes break the deploy silently.
3. **Logging/observability setup** — the current error-tracking story
   (self-hosted GlitchTip, per-app DSN creation) is setup students rarely
   complete, so they never get observability working.

## Goal

Collapse the student deploy to **one platform, one blueprint, zero
hand-typed env values**, and make "get my logs" an **MCP exercise** rather
than an infrastructure chore — reinforcing the course's existing MCP
theme.

## Decisions (settled during brainstorming)

- **One platform: Render.** Genuine free tier, **no credit card** for
  web/static services (lowest barrier for non-technical students). A
  committed blueprint provisions and self-wires everything.
- **Logs via the official Render MCP server.** Since students already
  deploy on Render, its official MCP server (auth via a single
  `RENDER_API_KEY`) exposes real-time logs, deploy status, metrics, and
  read-only Postgres queries — no extra vendor, no log shipping. This is
  the **cloud** counterpart to the existing **local** Grafana-MCP
  monitoring exercise (Session 7); the local observability stack is
  untouched.
- **CORS stays wide open (`FOODME_CORS_ALLOWED_ORIGINS=*`) on purpose.**
  FoodMe is a deliberately-vulnerable training target; this is an
  **intentional planted weakness** reserved for a future CORS /
  misconfiguration lesson. It must be commented as intentional so it is
  not "helpfully" tightened.
- **Error tracking (Sentry) stays optional.** `SENTRY_DSN` /
  `VITE_SENTRY_DSN` default blank (the app code already no-ops when
  empty); a short appendix wires hosted Sentry for the curious. Not on the
  critical path.
- **Add a `verify-deploy.sh` helper** that gives students a definitive
  "it worked" signal.

## Non-goals

- No change to the local `docker compose` stack or its observability
  profile (Grafana/Loki/Prometheus/GlitchTip remain for local Sessions).
- No change to the frozen API contract (`docs/api-contract.md`).
- No instructor-managed shared infrastructure; every student still owns
  their own deploy.
- Not migrating error tracking away from Sentry-compatible SDKs already
  wired in the apps.

## Architecture

### 1. Full-stack Render Blueprint (`render.yaml`)

Expand today's backend-only blueprint into the entire stack, wired via
Render's native blueprint references so **no env value is typed by hand**:

| Service | Type | Wiring |
|---|---|---|
| `foodme-db` | Render managed Postgres (`plan: free`) | source of `DATABASE_URL` |
| `foodme-backend` | web, `runtime: docker`, `apps/backend/Dockerfile` | `DATABASE_URL` via `fromDatabase`; `FOODME_CORS_ALLOWED_ORIGINS=*` (intentional); `SENTRY_DSN` blank; `healthCheckPath: /actuator/health` |
| `foodme-web` | static site, build `apps/web` | `VITE_API_BASE_URL` via `fromService` → backend host; publish `dist` |
| `foodme-admin` | static site, build `apps/admin` | `VITE_API_BASE_URL` via `fromService` → backend host; publish `dist` |

Key mechanics:

- **`fromDatabase`** injects the Postgres connection string into the
  backend automatically — replaces the hand-copied Neon `DATABASE_URL`.
- **`fromService`** (property `host`) injects the backend URL into each
  frontend's build-time `VITE_API_BASE_URL` — replaces the hand-copied
  `API_URL`. (Vite vars are build-time; Render static-site builds have
  blueprint env available, so this resolves at build.)
- Frontend build commands: web `npm ci && npm run build` (`tsc -b && vite
  build`), admin `npm ci && npm run build` (`vite build`); publish path
  `dist` for both. Static-site rewrite rule to `index.html` for SPA
  routing.
- CORS `*` is set directly in the blueprint (avoids a frontend→backend
  circular reference) and carries an inline comment marking it an
  intentional lab weakness.

Student flow: **New → Blueprint → pick fork → Apply.** A "Deploy to
Render" button (blueprint deep-link) in the README/deploy doc makes the
first step one click.

### 2. `docs/deployment.md` rewrite

Collapse from four platforms to one:

- Remove Neon and Vercel sections entirely.
- New flow: fork → "Deploy to Render" (or New Blueprint → pick fork →
  Apply) → wait for Live.
- **Verification section**: run `scripts/verify-deploy.sh <base-url>` (or
  manually open `/actuator/health` for `{"status":"UP"}` and the web URL).
- **Caveats, stated plainly**: free Postgres is deleted after ~30 days;
  free web services sleep after idle (~50s first-request cold start).
  Both acceptable for an 8-session, tear-down-after course.
- Output table still lists the three resulting URLs (web / admin / API),
  now all `*.onrender.com`.
- Optional **Sentry appendix**: create a hosted-Sentry project, paste one
  DSN into `SENTRY_DSN` (backend) / `VITE_SENTRY_DSN` (web, admin) env
  vars in the Render dashboard.

### 3. Logs via MCP (`qa/mcp/`)

- Add a **Render** section to `qa/mcp/README.md`: official server
  (`render-oss/render-mcp-server`), auth via `RENDER_API_KEY` from Render
  Dashboard → Account Settings → API Keys, framed **read-only** for
  students (they mainly read logs / deploy status / metrics). Note it is
  early-access and includes write/destructive tools, so the key should be
  treated with care and the exercise stays read-only.
- Add a `render` entry to `qa/mcp/.mcp.json.example` with `RENDER_API_KEY`
  referenced as an env var (never a literal), matching the folder's
  existing convention. Exact transport (hosted HTTP endpoint vs. local
  `npx`/Docker command) to be confirmed against the official server's
  current docs during implementation and documented accordingly.
- Add `RENDER_API_KEY` to the env-var table at the bottom of
  `qa/mcp/README.md`.
- Add a short **exercise note**: "Ask your agent for your deployed app's
  recent logs and last deploy status via the Render MCP server" — the
  cloud counterpart to the local Grafana-MCP Session-7 exercise.

### 4. `scripts/verify-deploy.sh`

- Input: the student's Render base URL(s). Minimal form takes the API base
  URL; may accept web URL too.
- Checks: `GET /actuator/health` expects `{"status":"UP"}`; one sample
  public `GET /api/**` endpoint (e.g. the chefs list) expects HTTP 200 and
  non-empty JSON.
- Output: clear `PASS` / `FAIL` lines per check and a non-zero exit on any
  failure. Pure `curl` + minimal parsing; no extra dependencies beyond
  what a student already has (fall back gracefully if `jq` is absent).

### 5. README cloud-deploy section

- Update the "Cloud lab deploy" section to describe the single-platform
  Render flow and the "Deploy to Render" button.
- Remove the Neon+Render+Vercel stack description; keep the "lab-only,
  tear down after the course" warning.

## Data flow (deploy time)

```
Render Blueprint (render.yaml, in student fork)
  └─ Apply ─┐
            ├─ foodme-db (Postgres)  ──DATABASE_URL──▶ foodme-backend
            ├─ foodme-backend (Docker) ──host──▶ VITE_API_BASE_URL of:
            ├─ foodme-web (static)
            └─ foodme-admin (static)
Runtime observability:  student agent ──RENDER_API_KEY──▶ Render MCP ──▶ logs/deploys/metrics
```

## Testing / verification

- **Blueprint validity**: apply the blueprint against a real Render
  workspace (fork) once; confirm all four resources reach Live and the two
  frontends load and reach the API with no manually-set env.
- **`verify-deploy.sh`**: run against the live deploy — expect all PASS;
  run against a bogus URL — expect FAIL and non-zero exit.
- **MCP**: with `RENDER_API_KEY` set, confirm an agent can list the service
  and fetch recent logs via the Render MCP server.
- **No-op Sentry**: confirm apps start and function with `SENTRY_DSN` /
  `VITE_SENTRY_DSN` blank.
- **Docs**: a dry read-through of `deployment.md` by someone unfamiliar,
  checking every step is copy-paste and no removed platform is referenced.

## Risks & mitigations

- **Render free Postgres 30-day deletion / web sleep** — documented as
  expected lab behavior; course is short-lived.
- **`fromService` build-time injection for static sites** — the one piece
  most likely to need adjustment; validate against a real Blueprint apply
  and fall back to a documented single manual env var only if Render does
  not resolve it at build for static sites.
- **Render MCP early-access / destructive tools** — scope the key, frame
  the exercise read-only, document the caveat.
- **Someone "fixes" CORS=\*** — inline comment marks it intentional; also
  noted in `docs/planted-defects.md` (if the CORS lesson is tracked there)
  during implementation.

## Deliverables

1. Expanded `render.yaml` (DB + backend + web + admin, self-wired).
2. Rewritten `docs/deployment.md` (single-platform + verification +
   caveats + optional Sentry appendix).
3. `qa/mcp/README.md` Render section + `qa/mcp/.mcp.json.example` `render`
   entry + env-var table update + logs-via-MCP exercise note.
4. `scripts/verify-deploy.sh`.
5. README "Cloud lab deploy" section update.
