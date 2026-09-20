# Monitoring stack (Prometheus + Loki + Grafana + Grafana MCP)

Separate Render blueprint (`render-monitoring.yaml`), deployed **after** the app,
into the **same Render project + region**.

All four components run in **one** Render service (`infra/monitoring/stack/`),
behind nginx, talking to each other over loopback:

| Path     | Component  | Notes                                     |
| -------- | ---------- | ----------------------------------------- |
| `/`      | Grafana    | login `admin` / `admin`, health `/api/health` |
| `/prom/` | Prometheus | served under `--web.route-prefix=/prom`   |
| `/loki/` | Loki       | app pushes to `/loki/api/v1/push`         |
| `/mcp`   | Grafana MCP| streamable-http                           |

> **Why one service.** Render's free web services can *send* private-network
> requests but **cannot receive** them, so private hostnames like
> `foodme-loki:10000` never resolve. Split across four services, every hop would
> need its neighbours' per-deploy `*.onrender.com` URLs pasted in by hand.
> Loopback removes all of that wiring.

## Scaffolding — two variables total

1. Deploy the app: `render.yaml`.
2. Deploy this stack: Render → New → Blueprint → `render-monitoring.yaml`.
3. On `foodme-monitoring` → Environment, set
   `BACKEND_HOST` = your backend's public host
   (e.g. `foodme-<user>-xxxx.onrender.com`), then redeploy it.
   Prometheus requires a bare hostname, but the entrypoint normalises the
   value first — a pasted `https://host/` or a trailing `:443` is fine.
   If the config still came out invalid the container exits at startup with
   `generated prometheus.yml is invalid`, rather than crash-looping.
4. On the **backend** service → Environment, set
   `LOKI_PUSH_URL` = `https://foodme-monitoring-xxxx.onrender.com/loki/api/v1/push`,
   and let it redeploy.

That's it. Grafana's datasources, the dashboards, and the MCP's Grafana
connection are all provisioned already.

Grafana MCP tokens are **optional** — the service deploys green without them;
they gate querying Grafana and caller auth. To set them (same service, then
redeploy):

- `GRAFANA_SERVICE_ACCOUNT_TOKEN` — Grafana → Administration → Service accounts →
  create SA (Editor) → generate token.
- `MCP_GRAFANA_SERVER_TOKEN` — your own secret: `openssl rand -hex 32`.
  Unset = the MCP serves unauthenticated to anyone with the URL.

## Data retention

Both stores keep **2 days**: Prometheus runs with
`--storage.tsdb.retention.time=48h` (plus a 256 MB size cap), and Loki runs its
compactor with `retention_enabled: true` and `retention_period: 48h`.

On the **free plan there is no persistent disk**, so in practice metrics and
logs are also lost on every restart and spin-down — the 2-day window is the
ceiling, not a guarantee. Attach a disk on a paid plan if you need history to
survive restarts.

## E2E

- **Prometheus → backend**: Grafana → Explore → Prometheus → `up{app="foodme-backend"}` = `1`.
- **Backend → Loki**: Grafana → Explore → Loki → `{app="foodme-backend"}` → recent lines.
- **Datasources**: Grafana → Connections → Data sources → Prometheus + Loki both test green.
- **Grafana MCP**: connect to `https://foodme-monitoring-<hash>.onrender.com/mcp`
  (streamable-http) with header `Authorization: Bearer <MCP_GRAFANA_SERVER_TOKEN>`,
  then list datasources, run PromQL (`up`) and LogQL (`{app="foodme-backend"}`).

If a panel shows "no data", the instance most likely spun down: free services
sleep when idle and take ~15-30s to wake, which can exceed Grafana's query
timeout. Load the Grafana URL once, wait for it, then re-run the query.

## Local smoke test

```bash
cd infra/monitoring
docker build -f stack/Dockerfile -t fz-stack .
docker run --rm -p 19999:10000 --memory 512m \
  -e PORT=10000 -e BACKEND_HOST=example.invalid \
  -e GF_SECURITY_ADMIN_USER=admin -e GF_SECURITY_ADMIN_PASSWORD=admin \
  fz-stack
# then: /api/health, /prom/-/healthy, /loki/api/v1/labels, /mcp
# and `docker exec <container> supervisorctl status` for per-process state
```
