# Monitoring stack (Prometheus + Loki + Grafana + Grafana MCP)

Separate Render blueprint (`render-monitoring.yaml`), deployed **after** the app,
into the **same Render project + region**.

> **Free tier can't receive private traffic.** Render's free web services can
> *send* private-network requests but **cannot receive** them, so private
> hostnames like `foodme-loki:10000` do **not** work. Every hop below uses the
> target's **public** `*.onrender.com` URL, supplied per-deploy via `sync: false`
> env vars (copy each from that service's page in the Render dashboard). Want
> real private DNS? Put the receiving services on a paid plan (`plan: starter`).

## Scaffolding

1. Deploy the app: `render.yaml`.
2. Deploy this stack: Render → New → Blueprint → `render-monitoring.yaml`.
   Wait for `foodme-prometheus`, `foodme-loki`, `foodme-grafana` to go live,
   then copy each service's public URL.
3. Wire the public URLs (Render → service → Environment), then redeploy each:
   - `foodme-prometheus` → `BACKEND_HOST` = backend host only, no scheme/port
     (e.g. `foodme-<user>-xxxx.onrender.com`).
   - Grafana → `PROMETHEUS_URL` = `https://foodme-prometheus-xxxx.onrender.com`,
     `LOKI_URL` = `https://foodme-loki-xxxx.onrender.com`.
   - `foodme-grafana-mcp` → `GRAFANA_URL` = `https://foodme-<user>-grafana-xxxx.onrender.com`.
4. Ship logs: set the app's `LOKI_PUSH_URL` = `https://foodme-loki-xxxx.onrender.com/loki/api/v1/push`
   and let the app redeploy.
5. Grafana MCP tokens — **optional for deployment** (the service is healthy
   without them; they gate querying Grafana and caller auth). Set on the
   `foodme-grafana-mcp` service, then redeploy it:
   - `GRAFANA_SERVICE_ACCOUNT_TOKEN` — Grafana → Administration → Service accounts →
     create SA (Editor) → generate token.
   - `MCP_GRAFANA_SERVER_TOKEN` — your own secret: `openssl rand -hex 32`.
     Unset = the MCP serves unauthenticated to anyone with the URL.

Login: `admin` / `admin` (change it after first login).

## E2E

- **Prometheus → backend**: Grafana → Explore → Prometheus → `up{app="foodme-backend"}` = `1`.
- **Backend → Loki**: Grafana → Explore → Loki → `{app="foodme-backend"}` → recent lines.
- **Datasources**: Grafana → Connections → Data sources → Prometheus + Loki both test green.
- **Grafana MCP**: connect to `https://foodme-grafana-mcp-<hash>.onrender.com/mcp` (streamable-http)
  with header `Authorization: Bearer <MCP_GRAFANA_SERVER_TOKEN>`, then:
  list datasources, run a PromQL query (`up`), run a LogQL query (`{app="foodme-backend"}`).
