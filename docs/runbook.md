# FoodMe runbook (instructor)

Operating guide for the person running the FoodMe stack for the agentic QA
course. This file is instructor-facing — it may reference that FoodMe has
planted, always-on defects, but it does not enumerate them; keep the specific
list to your own answer key.

All commands below are run from the repo root unless noted otherwise.

## 1. Compose profiles

`infra/docker-compose.yml` defines three profiles. They're additive — pass
more than one `--profile` flag to bring up several at once.

| Profile | Services | When you need it |
|---|---|---|
| `core` | postgres, minio (+ minio-init), backend, web, admin | Every session |
| `observability` | prometheus, loki, promtail, grafana, glitchtip (+ its postgres/redis) | Sessions 6–8 |
| `ci` | jenkins | Sessions 5, 7 |

Start:

```bash
docker compose -f infra/docker-compose.yml --profile core up -d
docker compose -f infra/docker-compose.yml --profile core --profile observability up -d
docker compose -f infra/docker-compose.yml --profile core --profile observability --profile ci up -d
```

Stop (add whichever profiles are currently up; `down` only tears down
services in the profiles you name):

```bash
docker compose -f infra/docker-compose.yml --profile core --profile observability --profile ci down
```

Stop and wipe all volumes (full reset, including the database and Grafana/
GlitchTip/Jenkins state):

```bash
docker compose -f infra/docker-compose.yml --profile core --profile observability --profile ci down -v
```

Check what's healthy:

```bash
docker compose -f infra/docker-compose.yml ps
curl -s localhost:8081/actuator/health
```

## 2. Port and credential map

| Service | URL | Credentials |
|---|---|---|
| Storefront | http://localhost:3000 | none (guest checkout) |
| Admin back office | http://localhost:3001 | `admin` / `admin123` (seeded) |
| Backend API | http://localhost:8081 | none (`/api/**` open); `/admin/**` needs a JWT from `/admin/auth/login` |
| Swagger UI | http://localhost:8081/swagger-ui.html | none |
| Postgres | localhost:5432 | from `.env`: `POSTGRES_USER` / `POSTGRES_PASSWORD`, db `foodme` |
| MinIO API | http://localhost:9000 | from `.env`: `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` (default `foodme`/`foodme123`) |
| MinIO console | http://localhost:9001 | same as above |
| Grafana | http://localhost:3002 | from `.env`: `GF_SECURITY_ADMIN_USER` / `GF_SECURITY_ADMIN_PASSWORD` (default `admin`/`admin`) |
| Prometheus | http://localhost:9090 | none |
| Loki | http://localhost:3100 (API, no UI — query via Grafana or `logcli`) | none |
| GlitchTip | http://localhost:8000 | first account you register (see §3) |
| Jenkins | http://localhost:8080 | from `.env`: `JENKINS_ADMIN_ID` / `JENKINS_ADMIN_PASSWORD` (default `admin`/`admin`) |

Container names (for `docker logs`, `docker exec`, Loki label matchers):
`foodme-postgres`, `foodme-minio`, `foodme-minio-init`, `foodme-backend`,
`foodme-web`, `foodme-admin`,
`foodme-prometheus`, `foodme-loki`, `foodme-promtail`, `foodme-grafana`,
`foodme-glitchtip-postgres`, `foodme-glitchtip-redis`,
`foodme-glitchtip-web`, `foodme-glitchtip-worker`, `foodme-jenkins`.

## 2b. Pictures in MinIO

Chef and dish pictures live in the `foodme-images` bucket. The one-shot
`minio-init` container runs on every `up` of the `core` profile: it creates
the bucket, sets an anonymous *download* policy on it (browsers load the
images directly, no signed URLs) and mirrors `apps/web/public/img/` into it.
Object keys mirror the repo layout, so `/img/chef/12-avatar.jpg` becomes:

```
http://localhost:9000/foodme-images/chef/12-avatar.jpg
```

Check or manage the contents from the console at http://localhost:9001, or
from the CLI:

```bash
docker run --rm --network foodme minio/mc:latest sh -c \
  'mc alias set local http://minio:9000 foodme foodme123 && mc ls -r local/foodme-images'
```

Re-seed after changing the files in `apps/web/public/img`:

```bash
docker compose -f infra/docker-compose.yml --profile core up minio-init
```

Wipe the bucket entirely (drops the `minio-data` volume):

```bash
docker compose -f infra/docker-compose.yml --profile core rm -sf minio
docker volume rm foodme_minio-data
```

Note: the apps still reference pictures by the relative `/img/...` paths
served by the storefront's nginx — the bucket is the storage backend that a
future upload/serving path in the backend (`MINIO_*` env vars are already
wired into the `backend` service) will read from.

## 3. First-run: GlitchTip DSN

GlitchTip needs an account and a DSN before the backend or either frontend
can report errors to it.

1. Bring up the `observability` profile (GlitchTip depends on its own
   Postgres and Redis, both included in that profile):

   ```bash
   docker compose -f infra/docker-compose.yml --profile core --profile observability up -d
   ```

2. Open <http://localhost:8000> and register the first account. With
   `ENABLE_USER_REGISTRATION=true` (set in `.env`), the first registered user
   becomes the organization owner — do this before anyone else touches the
   instance.
3. Create one project per app that should report errors: `foodme-backend`,
   `foodme-web`, `foodme-admin` (keeping them separate makes the Grafana/
   GlitchTip cross-referencing in Session 7 cleaner).
4. For each project, open **Settings → Client Keys (DSN)** and copy the DSN.
5. Paste the backend project's DSN into `SENTRY_DSN` in `.env`, and the
   web/admin DSNs into the corresponding `VITE_SENTRY_DSN` values (see the
   comments in `.env.example` for exactly which service reads which var).
6. Restart `core` so the apps pick up the new values:

   ```bash
   docker compose -f infra/docker-compose.yml --profile core up -d --force-recreate backend web admin
   ```

7. Verify: trigger a server error (any endpoint that 500s) and confirm it
   lands in the `foodme-backend` GlitchTip project within a few seconds.

## 4. Resetting the database to a clean seed

The backend runs Flyway migrations automatically on startup, including the
seed data migration — so the simplest full reset is to drop the Postgres
volume and let the backend re-seed on next boot:

```bash
docker compose -f infra/docker-compose.yml --profile core stop backend
docker compose -f infra/docker-compose.yml --profile core rm -f postgres
docker volume rm foodme_postgres-data   # actual volume name: `docker volume ls | grep postgres-data`
docker compose -f infra/docker-compose.yml --profile core up -d
```

To reset without touching Docker volumes (e.g. Postgres running outside
Docker), drop and recreate the schema and let Flyway rebuild it:

```bash
docker exec -it foodme-postgres psql -U foodme -d foodme \
  -c 'DROP SCHEMA IF EXISTS foodme CASCADE;'
docker compose -f infra/docker-compose.yml --profile core restart backend
```

Either way, watch the backend logs for the Flyway migration lines to confirm
it completed cleanly:

```bash
docker logs -f foodme-backend | grep -i flyway
```

## 5. Generating traffic

The Grafana dashboards and GlitchTip only have something to show once
requests have actually flowed through the stack. A quick way to generate a
realistic burst before a session:

```bash
# Explore + chef pages (read traffic)
for i in $(seq 1 30); do
  curl -s "localhost:8081/api/chef/active?page=0&size=12" -o /dev/null
  curl -s "localhost:8081/api/chef/1" -o /dev/null
  curl -s "localhost:8081/api/dish/1/active?page=0&size=50" -o /dev/null
done

# A handful of real orders, so order-creation metrics/logs have data
for i in $(seq 1 5); do
  curl -s -X POST localhost:8081/api/order \
    -H 'Content-Type: application/json' \
    -d '{"chefId":1,"receiverName":"Load Test","receiverPhoneNumber":"+37491000000","paymentType":"CASH","deliveryMethod":"TAKEAWAY","createOrderDishes":[{"dishId":10,"quantity":1}]}' \
    -o /dev/null
done

# A deliberate 4xx to populate error-rate panels without corrupting data
curl -s "localhost:8081/api/chef/999999" -o /dev/null
```

For end-to-end browser traffic (drives the frontend too, not just the API),
run the Playwright suite against the running stack:

```bash
cd apps/web && npm run test:e2e
```

## 6. CLI one-liners

**Loki (`logcli`)** — install from the Grafana Loki release page, point it at
the compose-exposed port:

```bash
export LOKI_ADDR=http://localhost:3100
logcli query '{container="foodme-backend"}' --limit=50
logcli query '{container="foodme-backend"} |= "ERROR"' --since=1h
```

**Prometheus** — query API or `promtool` against the exposed port:

```bash
curl -s 'localhost:9090/api/v1/query?query=up' | jq
curl -s 'localhost:9090/api/v1/query?query=http_server_requests_seconds_count' | jq
promtool query instant http://localhost:9090 'rate(http_server_requests_seconds_count[5m])'
```

**GlitchTip (`sentry-cli`)** — GlitchTip speaks the Sentry API, so the
standard `sentry-cli` works against it:

```bash
export SENTRY_URL=http://localhost:8000
export SENTRY_AUTH_TOKEN=<token from GlitchTip Settings > Auth Tokens>
sentry-cli --url $SENTRY_URL info
sentry-cli --url $SENTRY_URL issues list --org <your-org-slug> --project foodme-backend
```

**Jenkins (`jenkins-cli.jar`)**:

```bash
curl -s http://localhost:8080/jnlpJars/jenkins-cli.jar -o jenkins-cli.jar
java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:admin list-jobs
java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:admin build foodme -f
java -jar jenkins-cli.jar -s http://localhost:8080/ -auth admin:admin console foodme lastBuild
```

## 7. Per-session checklist

| Session | Profiles up | Notes |
|---|---|---|
| 1 — LLM anatomy | none required | Works entirely from `docs/requirements/` — the stack doesn't need to be running. |
| 2 — Context | `core` (optional) | Useful to have the running app for grounding, not required for the exercises. |
| 3 — Standardization | `core` | Students build `.claude/` commands, skills, hooks against a running app. |
| 4 — Tools | `core` | Plus Jira/Xray reachable (see `qa/mcp/README.md`) — this is a hosted SaaS dependency, not a local profile. |
| 5 — Pipelines | `core`, `ci` | Also needs the repo pushed to GitHub with Actions enabled and `ANTHROPIC_API_KEY` set (see root `README.md`). |
| 6 — Agentic workflows | `core`, `observability` | Exploratory testing and triage benefit from GlitchTip already wired up (§3). |
| 7 — Use cases | `core`, `observability`, `ci` | Needs traffic generated beforehand (§5) so dashboards and logs aren't empty, and enough historical CI runs on Jenkins/Actions for test-selection and flaky-test exercises to have signal. |
| 8 — Security | `core` | `observability` optional, useful for showing an exploit's blast radius in logs/errors. |

Bring the relevant profiles up the evening before a session, generate traffic
(§5), and spot-check the dashboards and GlitchTip so you're not debugging
infrastructure live in front of students.

## 8. Troubleshooting

**Backend won't start / Flyway fails.** Check `docker logs foodme-backend`
for the specific migration that failed. If a migration was previously applied
in a broken state, the fastest fix is the full reset in §4 rather than
hand-editing `flyway_schema_history`.

**Frontend loads but API calls fail (CORS or connection refused).** Confirm
`VITE_API_BASE_URL` in `.env` matches where the backend is actually reachable
from the browser (`http://localhost:8081`, not the in-network `backend:8081`
hostname — that only resolves inside the Compose network). Rebuild the
frontend images after changing `.env`; Vite bakes `VITE_*` vars in at build
time.

**Grafana dashboards are empty.** Confirm Prometheus is actually scraping:
<http://localhost:9090/targets> should show `foodme-backend` as `up`. If
not, check the backend's `/actuator/prometheus` endpoint responds directly.
Then generate traffic (§5) — an idle app has nothing to show.

**No logs in Loki / Grafana Explore.** Confirm `foodme-promtail` is running
and has access to the Docker socket (`docker logs foodme-promtail`). Promtail
tails container stdout, so a container that's been running a long time with
log rotation may have lost early history — that's expected, not a bug.

**GlitchTip won't accept the first registration / login loops.** Confirm
`GLITCHTIP_DOMAIN` in `.env` matches the URL you're actually opening in the
browser (`http://localhost:8000`), and that the `glitchtip-postgres` and
`glitchtip-redis` containers are both healthy — GlitchTip's web process
depends on both being reachable before it serves requests correctly.

**Jenkins job is red and it's not obvious why.** `console` via the CLI
(§6) is faster than the web UI for a full untruncated log. Most first-time
failures are Docker-socket permission issues (the `ci` profile mounts the
host socket so Jenkins can build images) or the pipeline running before
`core` has finished starting — check job order in `infra/jenkins/jenkins.yaml`.

**Playwright E2E suite fails locally but passed in CI, or vice versa.**
Before assuming a real regression, remember this suite deliberately contains
flaky tests as part of the course material — a single red run isn't
necessarily meaningful. Re-run before diagnosing, and note whether the
failure is one you've seen flake before.

**A student can't reach Jira/Xray/Grafana MCP servers.** These aren't part
of this compose stack (Jira/Xray are hosted SaaS; Grafana is local but its
MCP server is a separate process the student runs). Point them at
`qa/mcp/README.md` first — most connection issues are a missing environment
variable rather than something wrong with FoodMe itself.
