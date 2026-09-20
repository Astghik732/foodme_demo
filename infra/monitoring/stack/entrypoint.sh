#!/bin/sh
# Render assigns $PORT at runtime and neither nginx nor Prometheus expands env
# vars in their config files, so substitute them here before starting anything.
set -e

: "${PORT:=10000}"

# Prometheus scrapes the backend over its PUBLIC https URL (free services can't
# be reached privately). Empty BACKEND_HOST is fine on a first deploy: the
# target is simply unreachable and Prometheus still starts and serves.
sed "s|__BACKEND_HOST__|${BACKEND_HOST}|g" \
    /etc/foodme/prometheus.tmpl.yml > /tmp/prometheus.yml

sed "s|__PORT__|${PORT}|g" \
    /etc/foodme/nginx.conf.template > /etc/nginx/nginx.conf

exec supervisord -c /etc/foodme/supervisord.conf
