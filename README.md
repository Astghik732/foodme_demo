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
> Leave `LOKI_PUSH_URL` blank for now — you set it in step 3 once monitoring exists.

---

## 3. Render — monitoring service

Prometheus, Loki, Grafana and the Grafana MCP all run in **one** service,
reached on one URL:

| Path | Component |
|---|---|
| `/` | Grafana (`admin` / `admin`) |
| `/prom/` | Prometheus |
| `/loki/` | Loki |
| `/mcp` | Grafana MCP |

> **Why one service?** Render's free web services can *send* private-network
> requests but **cannot receive** them, so private hostnames like
> `foodme-loki:10000` do **not** work. Keeping the components in one container
> lets them talk over loopback, which is what reduces the setup below to two
> variables instead of six public URLs.

1. **New → Blueprint → `render-monitoring.yaml`.** Wait for `foodme-monitoring`
   to go live, then copy its public URL.

2. **Point Prometheus at your backend.** On `foodme-monitoring` → Environment,
   set `BACKEND_HOST` to your backend's host only — no scheme, no port, e.g.
   `foodme-<user>-xxxx.onrender.com` — then redeploy it.

3. **Ship logs.** On the **app** service set `LOKI_PUSH_URL` to
   `https://foodme-monitoring-xxxx.onrender.com/loki/api/v1/push` and let it
   redeploy.

That's both variables. Datasources, dashboards, and the MCP's Grafana
connection are provisioned automatically.

4. **Grafana MCP tokens** — *optional for deployment*. The service deploys and
   passes its health check with none of these set; you only need them to
   actually query Grafana through the MCP (and to require auth from callers).
   Set them on `foodme-monitoring`, then redeploy it:
   - `GRAFANA_SERVICE_ACCOUNT_TOKEN` — Grafana → Administration → Service
     accounts → create SA (Editor) → generate token.
   - `MCP_GRAFANA_SERVER_TOKEN` — your own secret: `openssl rand -hex 32`.
     Until this is set the MCP serves **unauthenticated** to anyone who finds
     the URL, and logs a SECURITY warning on startup.

Grafana login: `admin` / `admin` (change it after first login).

**Verify:** Grafana → Explore → Prometheus → `up{app="foodme-backend"}` = `1`;
Loki → `{app="foodme-backend"}` shows recent lines.

**Retention is 2 days** for both metrics and logs. Be aware the free plan has
no persistent disk, so data is also wiped on every restart/spin-down, and a
sleeping instance takes ~15-30s to wake — a first query after idle can time out
and render as "no data". See `infra/monitoring/README.md`.