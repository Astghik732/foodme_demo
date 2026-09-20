FROM prom/prometheus:v2.54.1
COPY prometheus.yml /etc/prometheus/prometheus.yml
# Render assigns $PORT; bind it. Falls back to 9090 for local smoke tests.
ENTRYPOINT ["/bin/sh", "-c", "exec /bin/prometheus --config.file=/etc/prometheus/prometheus.yml --storage.tsdb.path=/prometheus --web.listen-address=:${PORT:-9090}"]
