FROM grafana/grafana:11.2.2
COPY provisioning/ /etc/grafana/provisioning/
# Render assigns $PORT; Grafana reads GF_SERVER_HTTP_PORT.
ENTRYPOINT ["/bin/sh", "-c", "GF_SERVER_HTTP_PORT=${PORT:-3000} exec /run.sh"]
