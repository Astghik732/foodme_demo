FROM prom/prometheus:v2.54.1
# On Render's free plan, web services can't receive private-network traffic, so
# Prometheus scrapes the backend's PUBLIC URL. The config ships with a
# __BACKEND_HOST__ placeholder that is replaced at startup from the BACKEND_HOST
# env var (set this on the foodme-prometheus service in the Render dashboard).
COPY prometheus.yml /etc/prometheus/prometheus.tmpl.yml
# Render assigns $PORT; bind it. Falls back to 9090 for local smoke tests.
ENTRYPOINT ["/bin/sh", "-c", "sed \"s|__BACKEND_HOST__|${BACKEND_HOST}|g\" /etc/prometheus/prometheus.tmpl.yml > /tmp/prometheus.yml && exec /bin/prometheus --config.file=/tmp/prometheus.yml --storage.tsdb.path=/prometheus --web.listen-address=:${PORT:-9090}"]
