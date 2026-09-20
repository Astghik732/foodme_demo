# FoodMe monitoring — Prometheus + Loki + Grafana + Grafana MCP in ONE service.
#
# Why one container instead of four services:
#   * Render's FREE plan can't RECEIVE private-network traffic, so four separate
#     services would have to reach each other over public URLs — which means
#     hand-wiring a URL env var per hop after every deploy (5 of them).
#     Inside one container every hop is 127.0.0.1, so they need no wiring.
#   * Four free services = four independent spin-downs. A cold Loki takes ~30s
#     to wake, which exceeds Grafana's query timeout and renders as "no data".
#     One service = one spin-down.
#
# Only ONE thing still has to be wired by hand: BACKEND_HOST (what Prometheus
# scrapes). Logs travel the other way, so the backend needs the monitoring URL.
#
# Render exposes a single port, so nginx fronts everything:
#   /            -> Grafana        (also the health check, /api/health)
#   /prom/       -> Prometheus     (API + UI, served under its route-prefix)
#   /loki/       -> Loki           (native /loki/api/v1/* paths, incl. push)
#   /mcp         -> Grafana MCP    (streamable-http)
#
# NOTE: free instances have no persistent disk. Prometheus TSDB and Loki chunks
# live in the container filesystem and are WIPED on every restart/spin-down.
# That is a free-tier limit, not a bug — use paid disks if you need history.

FROM prom/prometheus:v2.54.1 AS prometheus
FROM grafana/loki:3.2.1 AS loki
FROM grafana/mcp-grafana:1.5.1 AS mcp

FROM grafana/grafana:11.2.2

# Grafana's image runs as uid 472; we need root to install and supervise.
USER root

RUN apk add --no-cache nginx supervisor

# Static Go binaries lifted from the official images.
COPY --from=prometheus /bin/prometheus      /usr/local/bin/prometheus
COPY --from=loki       /usr/bin/loki        /usr/local/bin/loki
COPY --from=mcp        /app/mcp-grafana     /usr/local/bin/mcp-grafana

COPY stack/prometheus.yml       /etc/foodme/prometheus.tmpl.yml
COPY stack/loki-config.yml      /etc/foodme/loki-config.yml
COPY stack/nginx.conf.template  /etc/foodme/nginx.conf.template
COPY stack/supervisord.conf     /etc/foodme/supervisord.conf
COPY stack/entrypoint.sh        /usr/local/bin/entrypoint.sh

# Datasources point at 127.0.0.1 (see stack/provisioning); dashboards are shared.
COPY stack/provisioning/ /etc/grafana/provisioning/

RUN mkdir -p /prometheus /loki/chunks /loki/rules /loki/compactor /run/nginx /var/log/supervisor \
    && chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
