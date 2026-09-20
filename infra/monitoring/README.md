# Monitoring stack (Prometheus + Loki + Grafana + Grafana MCP)

Separate Render blueprint (`render-monitoring.yaml`), deployed **after** the app,
into the **same Render project + region** (required for private DNS).

## Scaffolding

1. Deploy the app: `render.yaml`.
2. Deploy this stack: Render → New → Blueprint → `render-monitoring.yaml`.
   Set `GF_SECURITY_ADMIN_PASSWORD` when prompted. Wait for `foodme-prometheus`,
   `foodme-loki`, `foodme-grafana` to go live.
3. Confirm each service's internal port (Render → service → Connect). If not
   `10000`, update `prometheus/prometheus.yml`, `grafana/provisioning/datasources/datasources.yml`,
   and the `foodme-grafana-mcp` `GRAFANA_URL`, then redeploy.
4. Ship logs: set the app's `LOKI_PUSH_URL` = `http://foodme-loki:<port>/loki/api/v1/push`
   and let the app redeploy.
5. Grafana MCP tokens (on the `foodme-grafana-mcp` service), then redeploy it:
   - `GRAFANA_SERVICE_ACCOUNT_TOKEN` — Grafana → Administration → Service accounts →
     create SA (Editor) → generate token.
   - `MCP_GRAFANA_SERVER_TOKEN` — your own secret: `openssl rand -hex 32`.

Login: `admin` / `GF_SECURITY_ADMIN_PASSWORD`.

## E2E

- **Prometheus → backend**: Grafana → Explore → Prometheus → `up{app="foodme-backend"}` = `1`.
- **Backend → Loki**: Grafana → Explore → Loki → `{app="foodme-backend"}` → recent lines.
- **Datasources**: Grafana → Connections → Data sources → Prometheus + Loki both test green.
- **Grafana MCP**: connect to `https://foodme-grafana-mcp-<hash>.onrender.com/mcp` (streamable-http)
  with header `Authorization: Bearer <MCP_GRAFANA_SERVER_TOKEN>`, then:
  list datasources, run a PromQL query (`up`), run a LogQL query (`{app="foodme-backend"}`).
