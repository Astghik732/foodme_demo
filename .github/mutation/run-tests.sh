#!/usr/bin/env bash
# Runs the unit/e2e tests of ONE module and decides, deterministically, what a mutation did.
#
#   run-tests.sh <backend|web|admin> --baseline   run the whole suite on the unmodified code and
#                                                 remember which tests already fail
#   run-tests.sh <backend|web|admin>              the working tree holds ONE mutation: run the
#                                                 suite (fail-fast), classify the mutant, then
#                                                 ALWAYS revert apps/ back to HEAD
#
# Mutant status (printed as JSON on stdout and saved to .mutation/last-run.json):
#   killed    a test that passed in the baseline now fails (confirmed by a second run)
#   survived  the suite still passes (apart from tests that already failed in the baseline)
#   timeout   the suite hung / exceeded the time limit (counts as killed)
#   invalid   the mutant did not compile / start (0 tests ran); excluded from the score
#   rejected  the change set was not exactly one production file of this module; not run
#
# "Killed" is always measured against the baseline, so tests that are already broken or flaky
# on the unmodified code (e.g. FM-BUG / FM-FLAKE ones) cannot kill a mutant by themselves.
set -uo pipefail

MODULE="${1:-}"
MODE="${2:-mutant}"
case "$MODULE" in
  backend | web | admin) ;;
  *) echo '{"status":"error","reason":"usage: run-tests.sh <backend|web|admin> [--baseline]"}'; exit 2 ;;
esac

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
OUT="$ROOT/.mutation"
HERE="$ROOT/.github/mutation"
mkdir -p "$OUT/logs"
TIMEOUT_MIN="${MUTANT_TEST_TIMEOUT_MIN:-20}"
API="${MUTATION_API_URL:-http://localhost:8082}"
MAX="${MAX_MUTANTS_PER_MODULE:-8}"
LOG="$OUT/logs/$MODULE-$(date +%s)-$$.log"
BASE="$OUT/baseline-$MODULE.json"

revert() { git restore --source=HEAD --worktree -- apps >/dev/null 2>&1 || true; }

# run_suite <fail-fast 0|1> [extra filter args]  ->  sets RC and PARSED ({ran, failed[]})
run_suite() {
  local failfast="$1"
  shift
  if [ "$MODULE" = backend ]; then
    rm -rf apps/backend/build/test-results
    local ff=""
    [ "$failfast" = 1 ] && ff="--fail-fast"
    (cd apps/backend && timeout "${TIMEOUT_MIN}m" gradle test -I "$HERE/testcases.init.gradle" --console=plain $ff "$@") >>"$LOG" 2>&1
    RC=$?
    PARSED="$(node "$HERE/parse-results.mjs" junit apps/backend/build/test-results/test)"
  else
    rm -f "$OUT/pw-$MODULE.json"
    local mf=""
    [ "$failfast" = 1 ] && mf="--max-failures=1"
    (cd "apps/$MODULE" && VITE_API_BASE_URL="$API" PLAYWRIGHT_JSON_OUTPUT_NAME="$OUT/pw-$MODULE.json" \
      timeout "${TIMEOUT_MIN}m" npx playwright test --reporter=json --retries=0 $mf "$@") >>"$LOG" 2>&1
    RC=$?
    PARSED="$(node "$HERE/parse-results.mjs" playwright "$OUT/pw-$MODULE.json")"
  fi
}

# ---------------------------------------------------------------- baseline
if [ "$MODE" = "--baseline" ]; then
  revert
  run_suite 0
  ran="$(jq -r .ran <<<"$PARSED")"
  if [ "$ran" -eq 0 ]; then
    echo "::error::Baseline for module '$MODULE' ran 0 tests - the suite cannot run in this environment. Last log lines:"
    tail -n 40 "$LOG"
    exit 1
  fi
  echo "$PARSED" >"$BASE"
  echo "baseline $MODULE: $(jq -r '.ran' "$BASE") tests, $(jq -r '.failed | length' "$BASE") already failing (ignored when judging mutants)"
  exit 0
fi

# ------------------------------------------------------------------ mutant
[ -f "$BASE" ] || echo '{"ran":0,"failed":[]}' >"$BASE"

reject() {
  revert
  jq -n --arg m "$MODULE" --arg r "$1" '{status:"rejected", module:$m, reason:$r, testsPassed:null}' | tee "$OUT/last-run.json"
  exit 0
}

if [ -f "$OUT/mutants.jsonl" ]; then
  used="$(jq -s --arg m "$MODULE" '[.[] | select(.module==$m and .status!="invalid")] | length' "$OUT/mutants.jsonl")"
  [ "$used" -lt "$MAX" ] || reject "mutant limit reached for $MODULE ($MAX); stop generating mutants for this module"
fi

changed="$(git diff --name-only -- apps | sed '/^$/d')"
count="$(printf '%s\n' "$changed" | sed '/^$/d' | wc -l | tr -d ' ')"
[ "$count" -eq 1 ] || reject "expected exactly 1 modified file under apps/, found $count: $(printf '%s ' $changed)"
file="$changed"
case "$file" in "apps/$MODULE/"*) ;; *) reject "mutated file $file is not part of module $MODULE" ;; esac
case "$file" in
  */src/test/* | */e2e/* | *.spec.* | *.test.* | */package.json | */package-lock.json | *playwright.config* | *build.gradle* | */vite.config.* | */tsconfig*.json)
    reject "refusing to mutate a test or config file: $file" ;;
esac

diff="$(git diff -U0 -- "$file")"
line="$(printf '%s\n' "$diff" | sed -n 's/^@@ -[0-9,]* +\([0-9]*\).*/\1/p' | head -n1)"
trap revert EXIT

start="$(date +%s)"
run_suite 1
status="survived"
killed_by='[]'
note=""

if [ "$RC" -eq 124 ]; then
  status="timeout"
else
  ran="$(jq -r .ran <<<"$PARSED")"
  new="$(jq -c --slurpfile b "$BASE" '.failed - $b[0].failed' <<<"$PARSED")"
  if [ "$ran" -eq 0 ]; then
    status="invalid"
    note="no tests ran (compile error or app failed to start)"
  elif [ "$new" != "[]" ]; then
    # Confirm the kill: re-run only the failing classes/files once, to rule out flaky tests.
    if [ "$MODULE" = backend ]; then
      args=()
      while IFS= read -r c; do args+=(--tests "$c"); done < <(jq -r '.[] | split("::")[0]' <<<"$new" | sort -u)
    else
      args=()
      while IFS= read -r f; do args+=("$f"); done < <(jq -r '.[] | split("::")[0]' <<<"$new" | sort -u)
    fi
    run_suite 0 "${args[@]}"
    confirmed="$(jq -c --argjson n "$new" '.failed as $f | $n | map(select(. as $x | $f | index($x)))' <<<"$PARSED")"
    if [ "$confirmed" != "[]" ]; then
      status="killed"
      killed_by="$confirmed"
    else
      note="failed once but passed on re-run (flaky), treated as survived"
    fi
  fi
fi

end="$(date +%s)"
jq -n \
  --arg status "$status" --arg module "$MODULE" --arg file "$file" --arg line "${line:-0}" \
  --arg diff "$diff" --arg note "$note" --arg log "${LOG#"$ROOT/"}" \
  --argjson killedBy "$killed_by" --argjson seconds "$((end - start))" \
  '{status:$status, module:$module, file:$file, line:($line|tonumber), killedBy:$killedBy,
    testsPassed:(if $status=="survived" then true elif $status=="invalid" then null else false end),
    note:$note, seconds:$seconds, diff:$diff, log:$log}' | tee "$OUT/last-run.json"
