import * as Sentry from "@sentry/react";

/**
 * Demo-only background check for the QA course. On a timer it mostly succeeds
 * and fails roughly one tick in ten, reporting the failure to GlitchTip via
 * Sentry. This gives the error tracker a realistic trickle of admin events; it
 * never touches the UI. If no DSN is configured, Sentry.captureException is a
 * no-op, so this stays silent.
 */
const FAIL_ONE_IN = 10;
const INTERVAL_MS = 60_000;

const SCENARIOS = [
  "refresh chef roster",
  "recount pending orders",
  "sync dish availability",
  "rebuild order report",
  "check payout status",
];

function tick() {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  if (Math.floor(Math.random() * FAIL_ONE_IN) === 0) {
    Sentry.captureException(
      new Error(`Admin background task failed: ${scenario}`),
    );
  }
}

export function startFlakyHeartbeat() {
  setInterval(tick, INTERVAL_MS);
}
