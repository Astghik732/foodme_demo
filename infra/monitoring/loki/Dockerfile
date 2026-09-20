FROM grafana/loki:3.2.1
COPY loki-config.yml /etc/loki/loki-config.yml
# -config.expand-env lets ${PORT} in the config resolve to Render's assigned port.
ENTRYPOINT ["/bin/sh", "-c", "exec /usr/bin/loki -config.file=/etc/loki/loki-config.yml -config.expand-env=true"]
