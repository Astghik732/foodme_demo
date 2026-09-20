#!/bin/sh
# Render assigns $PORT at runtime and neither nginx nor Prometheus expands env
# vars in their config files, so substitute them here before starting anything.
set -e

: "${PORT:=10000}"

# Prometheus scrapes the backend over its PUBLIC https URL (free services can't
# be reached privately). Prometheus wants a BARE hostname here: anything else —
# a pasted "https://host/", a ":443" already on the end — is rejected as "not a
# valid hostname", and since that is a config parse error Prometheus exits
# immediately, supervisord gives up after three tries, and the whole /prom/
# route serves 502 forever. Pasting the full URL from the Render dashboard is
# the obvious mistake to make, so normalise instead of trusting the value:
# drop any scheme, any /path, and any :port.
BACKEND_HOST=$(printf '%s' "${BACKEND_HOST}" | sed \
    -e 's#^[A-Za-z][A-Za-z0-9+.-]*://##' \
    -e 's#/.*$##' \
    -e 's#:[0-9]*$##' \
    -e 's#[[:space:]]##g')

if [ -z "${BACKEND_HOST}" ]; then
    # First deploy, before the student has wired the backend. Start with an
    # empty target list rather than a bogus ":443" one so Prometheus comes up
    # clean and /prom/ is reachable.
    echo "entrypoint: BACKEND_HOST is unset - starting with no scrape target"
    sed 's|^\( *\)- targets: \[.*\]|\1- targets: []|' \
        /etc/foodme/prometheus.tmpl.yml > /tmp/prometheus.yml
else
    echo "entrypoint: scraping backend at ${BACKEND_HOST}:443"
    sed "s|__BACKEND_HOST__|${BACKEND_HOST}|g" \
        /etc/foodme/prometheus.tmpl.yml > /tmp/prometheus.yml
fi

# Fail loudly here rather than crash-looping later.
/usr/local/bin/promtool check config /tmp/prometheus.yml || {
    echo "entrypoint: generated prometheus.yml is invalid (BACKEND_HOST=${BACKEND_HOST})" >&2
    exit 1
}

sed "s|__PORT__|${PORT}|g" \
    /etc/foodme/nginx.conf.template > /etc/nginx/nginx.conf

# The Grafana MCP needs credentials to query Grafana. A service account token is
# the obvious choice, but that token lives in Grafana's SQLite DB under
# /var/lib/grafana, which is WIPED on every redeploy (free tier has no disk) —
# so it would go stale after the next deploy and the MCP would silently lose
# access. So we don't use one: authenticate the MCP as the admin user over
# loopback instead. Those credentials are stable env vars re-applied fresh on
# every boot, so nothing to persist and nothing to regenerate.
export GRAFANA_USERNAME="${GF_SECURITY_ADMIN_USER:-admin}"
export GRAFANA_PASSWORD="${GF_SECURITY_ADMIN_PASSWORD:-admin}"
echo "entrypoint: MCP authenticates to Grafana as admin (basic auth)"

exec supervisord -c /etc/foodme/supervisord.conf
