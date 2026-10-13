#!/usr/bin/env bash
# Records the result of the LAST run-tests.sh call as one mutant in .mutation/mutants.jsonl.
#   record-mutant.sh <backend|web|admin> <classic|product> "<what was changed and why>"
# The status/killedBy/diff come from run-tests.sh (never from the agent), so the report cannot
# claim a result that was not measured.
set -uo pipefail
MODULE="${1:-}"; CATEGORY="${2:-}"; DESC="${3:-}"
ROOT="$(git rev-parse --show-toplevel)"
OUT="$ROOT/.mutation"
LAST="$OUT/last-run.json"
LIST="$OUT/mutants.jsonl"

[ -n "$DESC" ] && { [ "$CATEGORY" = classic ] || [ "$CATEGORY" = product ]; } || {
  echo "usage: record-mutant.sh <backend|web|admin> <classic|product> \"description\"" >&2; exit 2; }
[ -f "$LAST" ] || { echo "no run-tests.sh result to record (run it first)" >&2; exit 2; }
[ "$(jq -r .module "$LAST")" = "$MODULE" ] || { echo "last run was for module $(jq -r .module "$LAST"), not $MODULE" >&2; exit 2; }
if [ "$(jq -r .status "$LAST")" = rejected ]; then
  echo "last run was rejected ($(jq -r .reason "$LAST")); nothing recorded" >&2; rm -f "$LAST"; exit 3
fi

id=$(( $( [ -f "$LIST" ] && wc -l <"$LIST" || echo 0 ) + 1 ))
jq -c --argjson id "$id" --arg c "$CATEGORY" --arg d "$DESC" '. + {id:$id, category:$c, description:$d}' "$LAST" >>"$LIST"
rm -f "$LAST"
echo "recorded mutant #$id ($(tail -n1 "$LIST" | jq -r '"\(.module) \(.status) \(.file):\(.line)"'))"
