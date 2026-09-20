# Grafana MCP server for Render's FREE plan.
#
# We wrap the base image rather than using render.yaml's `dockerCommand` on an
# `image` service: Render wraps that value in its own `sh -c "..."`, so ANY
# quotes in it (needed for `-allowed-hosts "*"`) collide with Render's wrapper
# and the container exits 127 ("not found"). Owning the Dockerfile lets us
# control the start command's quoting ourselves — the same approach the other
# monitoring services (prometheus/loki/grafana) already use.
FROM grafana/mcp-grafana:1.5.1

# Reset the base ENTRYPOINT so our CMD is the whole command (otherwise Docker
# appends CMD to the image's ["/app/mcp-grafana", ...] entrypoint).
ENTRYPOINT []

# streamable-http transport, bound to Render's $PORT (shell form expands it at
# runtime). `-allowed-hosts "*"` disables Host-header validation, required
# because Render's TLS-terminating proxy forwards the public onrender.com Host;
# safe here since that proxy is the only ingress.
CMD ["sh", "-c", "exec /app/mcp-grafana -transport streamable-http -address 0.0.0.0:$PORT -allowed-hosts \"*\""]
