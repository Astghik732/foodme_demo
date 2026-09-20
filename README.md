# FoodMe — deploy scaffolding

---

## 1. Third party — GlitchTip error tracking

Register a free account at [glitchtip.com](https://glitchtip.com/) and create
**three** projects — one each for the backend, storefront, and admin.

---

## 2. Render — app services

0. **Initial Step**

- Fork repository
- Replace `armanayvazyan` with your GitHub username **everywhere** in the repo (one command):

  ```bash
  grep -rl armanayvazyan . --exclude-dir=.git | xargs sed -i '' 's/armanayvazyan/<your_github_username>/g'
  ```

  Verify none are left: `grep -rn armanayvazyan . --exclude-dir=.git` (should print nothing).
- Push changes

1. Click the button and deploy render.yaml 

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

- During deployment, paste the three GlitchTip DSNs from step 1 (`SENTRY_DSN`, `VITE_SENTRY_DSN_WEB`, `VITE_SENTRY_DSN_ADMIN`).

2. After deploy you'll find the storefront at `/`, the admin back office at
   `/backoffice`, and the API under `/api` and `/admin`.

Note: 
> Leave `LOKI_PUSH_URL` blank for now — you set it in step 3 once Loki exists.

---

## 3. Render — monitoring services

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