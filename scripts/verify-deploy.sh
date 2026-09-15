#!/usr/bin/env bash
# Verify a deployed FoodMe API is live and serving data.
# Usage: scripts/verify-deploy.sh <API_BASE_URL> [WEB_URL]
set -u

API="${1:-}"
if [ -z "$API" ]; then
  echo "usage: $0 <API_BASE_URL> [WEB_URL]" >&2
  exit 2
fi
API="${API%/}"   # strip trailing slash

fail=0
check() {
  local name="$1" url="$2" expect="$3"
  local body code
  body="$(curl -sS -m 30 -w $'\n%{http_code}' "$url" 2>/dev/null)" || { echo "FAIL  $name — request error ($url)"; fail=1; return; }
  code="${body##*$'\n'}"
  body="${body%$'\n'*}"
  if [ "$code" = "200" ] && printf '%s' "$body" | grep -qF "$expect"; then
    echo "PASS  $name"
  else
    echo "FAIL  $name — HTTP $code (expected 200 containing '$expect')"
    fail=1
  fi
}

echo "Checking $API ..."
check "health"     "$API/actuator/health" '"status":"UP"'
check "chefs list" "$API/api/chef/active" '['

if [ -n "${2:-}" ]; then
  echo "Storefront: ${2%/}"
fi

if [ "$fail" -eq 0 ]; then
  echo "All checks passed ✅"
else
  echo "Some checks failed ❌ — see docs/deployment.md troubleshooting." >&2
fi
exit "$fail"
