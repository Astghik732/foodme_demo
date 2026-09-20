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

> **Free tier = public URLs, not private DNS.** Render's free web services can
> *send* private-network requests but **cannot receive** them, so private
> hostnames like `foodme-loki:10000` do **not** work. Every service therefore
> talks to the others over their **public** `*.onrender.com` URL. Each URL is
> unique to your deploy — copy it from that service's page in the Render
> dashboard (it's shown under the service name). Full private DNS instead? Put
> the receiving services on a paid plan (`plan: starter`).

1. **New → Blueprint → `render-monitoring.yaml`.** Wait for `foodme-prometheus`,
   `foodme-loki`, and `foodme-*-grafana` to go live, then copy each service's
   public URL.

2. **Wire the public URLs** (Render → service → Environment). No file edits —
   just set these env vars, then redeploy each service:

   | Service | Env var | Value (your own public URL) |
   |---|---|---|
   | `foodme-prometheus` | `BACKEND_HOST` | backend host only, e.g. `foodme-<user>-xxxx.onrender.com` |
   | `foodme-*-grafana` | `PROMETHEUS_URL` | `https://foodme-prometheus-xxxx.onrender.com` |
   | `foodme-*-grafana` | `LOKI_URL` | `https://foodme-loki-xxxx.onrender.com` |
   | `foodme-grafana-mcp` | `GRAFANA_URL` | `https://foodme-<user>-grafana-xxxx.onrender.com` |

3. **Ship logs.** On the **app** service set `LOKI_PUSH_URL` to
   `https://foodme-loki-xxxx.onrender.com/loki/api/v1/push` and let it redeploy.

4. **Grafana MCP tokens** — *optional for deployment*. `foodme-grafana-mcp`
   deploys and passes its health check with none of these set; you only need
   them to actually query Grafana through the MCP (and to require auth from
   callers). Set them on the `foodme-grafana-mcp` service, then redeploy it:
   - `GRAFANA_SERVICE_ACCOUNT_TOKEN` — Grafana → Administration → Service
     accounts → create SA (Editor) → generate token.
   - `MCP_GRAFANA_SERVER_TOKEN` — your own secret: `openssl rand -hex 32`.
     Until this is set the MCP serves **unauthenticated** to anyone who finds
     the URL, and logs a SECURITY warning on startup.

Grafana login: `admin` / `admin` (change it after first login).

**Verify:** Grafana → Explore → Prometheus → `up{app="foodme-backend"}` = `1`;
Loki → `{app="foodme-backend"}` shows recent lines.