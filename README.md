# FoodMe — deploy scaffolding

> ⚠️ **Training target — deliberately defective and deliberately insecure.**
> Run it only in an isolated lab. Do not expose it to the internet or reuse its
> code, dependencies, or configuration in a real product.

Everything below is the click-by-click scaffolding to stand FoodMe up in the
cloud, in the order you should run it:

1. [Third party — GlitchTip error tracking](#1-third-party--glitchtip-error-tracking)
2. [Render — app services](#2-render--app-services)
3. [Render — monitoring services](#3-render--monitoring-services)

Do them in that order: GlitchTip DSNs are consumed by the app blueprint, and the
app must be live before the monitoring stack can reach it over private DNS.

---

## 1. Third party — GlitchTip error tracking

Register a free account at [glitchtip.com](https://glitchtip.com/) and create
**three** projects — one each for the backend, storefront, and admin. The app
blueprint (step 2) prompts for three `sync: false` env vars; paste each
project's **DSN** to match:

| Env var | Project | Read at |
|---|---|---|
| `SENTRY_DSN` | backend | runtime |
| `VITE_SENTRY_DSN_WEB` | storefront | build time |
| `VITE_SENTRY_DSN_ADMIN` | admin | build time |

Leave any blank to disable tracking for that app. The two `VITE_` values are
baked into the frontend bundles during the Docker build, so changing them later
needs a fresh deploy, not just a restart. Once live, all three apps also emit a
periodic demo "background task" that fails ~1 run in 10, so GlitchTip shows a
realistic trickle of events without anyone clicking around.

---

## 2. Render — app services

Blueprint: [`render.yaml`](render.yaml). Everything runs as **one** Render web
service that serves the API and both frontends on a single origin, plus a free
Postgres database.

**Fork → edit `render.yaml` → New Blueprint → Apply.**

1. **After forking, edit `render.yaml` first.** Give the service a name nobody
   else has taken — replace the handle `armanayvazyan` with your own (e.g. your
   GitHub username):

   ```yaml
   name: foodme-<your-handle>
   ```

   Because the storefront, admin, and API share one host, the exact name (and
   any random suffix Render adds on a collision) does not affect whether the app
   works.

2. **New → Blueprint → point at `render.yaml` → Apply.** When prompted, paste
   the three GlitchTip DSNs from step 1 (`SENTRY_DSN`, `VITE_SENTRY_DSN_WEB`,
   `VITE_SENTRY_DSN_ADMIN`).

3. Leave `LOKI_PUSH_URL` blank for now — you set it in step 3 once Loki exists.

After deploy you'll find the storefront at `/`, the admin back office at
`/backoffice`, and the API under `/api` and `/admin`.

> Full click-by-click walkthrough: [`docs/deployment.md`](docs/deployment.md).

---

## 3. Render — monitoring services

Blueprint: [`render-monitoring.yaml`](render-monitoring.yaml) — a **separate**
blueprint (Prometheus + Loki + Grafana + Grafana MCP). Deploy it **after** the
app, into the **same Render project + region** so private DNS (service-name
resolution) works. All services are free/ephemeral and never auto-redeploy on
app code pushes.

> On Render's **free** plan there are no private services, so every monitoring
> service is a `web` service. Prometheus/Loki are still reached internally via
> private DNS (`foodme-prometheus:PORT` / `foodme-loki:PORT`) but also get a
> public URL. For truly private Prometheus/Loki, switch those two to
> `type: pserv` on a paid plan. Internal URLs are wired by **service name** — if
> you rename a service, update `datasources.yml`, the backend `LOKI_PUSH_URL`,
> and `GRAFANA_URL`.

1. **New → Blueprint → `render-monitoring.yaml`.** Set
   `GF_SECURITY_ADMIN_PASSWORD` when prompted. Wait for `foodme-prometheus`,
   `foodme-loki`, and `foodme-grafana` to go live.

2. **Confirm internal ports.** For each service (Render → service → Connect)
   check its internal port. If it is not `10000`, update
   `prometheus/prometheus.yml`,
   `grafana/provisioning/datasources/datasources.yml`, and the
   `foodme-grafana-mcp` `GRAFANA_URL`, then redeploy.

3. **Ship logs.** Set the app's `LOKI_PUSH_URL` (step 2 service) to
   `http://foodme-loki:<port>/loki/api/v1/push` and let the app redeploy.

4. **Grafana MCP tokens** (on the `foodme-grafana-mcp` service), then redeploy it:
   - `GRAFANA_SERVICE_ACCOUNT_TOKEN` — Grafana → Administration → Service
     accounts → create SA (Editor) → generate token.
   - `MCP_GRAFANA_SERVER_TOKEN` — your own secret: `openssl rand -hex 32`.

Grafana login: `admin` / `GF_SECURITY_ADMIN_PASSWORD`.

### Verify end to end

- **Prometheus → backend**: Grafana → Explore → Prometheus →
  `up{app="foodme-backend"}` = `1`.
- **Backend → Loki**: Grafana → Explore → Loki → `{app="foodme-backend"}` →
  recent lines.
- **Datasources**: Grafana → Connections → Data sources → Prometheus + Loki both
  test green.
- **Grafana MCP**: connect to
  `https://foodme-grafana-mcp-<hash>.onrender.com/mcp` (streamable-http) with
  header `Authorization: Bearer <MCP_GRAFANA_SERVER_TOKEN>`, then list
  datasources, run a PromQL query (`up`), and run a LogQL query
  (`{app="foodme-backend"}`).

More detail: [`infra/monitoring/README.md`](infra/monitoring/README.md).
