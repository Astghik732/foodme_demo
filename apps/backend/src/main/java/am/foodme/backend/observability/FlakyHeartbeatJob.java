package am.foodme.backend.observability;

import io.sentry.Sentry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Demo-only background heartbeat for the QA course. It runs periodically,
 * succeeds most of the time, and fails roughly one run in {@link #FAIL_ONE_IN}
 * — reporting the failure to GlitchTip via Sentry. The point is to give the
 * error tracker a realistic, steady trickle of backend events without ever
 * affecting a real user request. The app stays healthy: the "failure" is
 * caught and only reported, never rethrown.
 *
 * <p>Disabled under the {@code test} profile so the JUnit suite is quiet and
 * deterministic. Tune or silence it with {@code foodme.flaky.heartbeat-ms}.
 */
@Component
@Profile("!test")
public class FlakyHeartbeatJob {

    private static final Logger log = LoggerFactory.getLogger(FlakyHeartbeatJob.class);

    /** On average one run in this many is made to fail. */
    private static final int FAIL_ONE_IN = 10;

    private static final String[] SCENARIOS = {
            "nightly payout reconciliation",
            "chef availability sync",
            "order settlement batch",
            "menu search reindex",
            "delivery ETA recompute",
    };

    @Scheduled(fixedDelayString = "${foodme.flaky.heartbeat-ms:60000}", initialDelay = 20000)
    public void run() {
        String scenario = SCENARIOS[ThreadLocalRandom.current().nextInt(SCENARIOS.length)];
        try {
            simulate(scenario);
            log.debug("Heartbeat job '{}' ok", scenario);
        } catch (RuntimeException ex) {
            // Report to GlitchTip but keep serving traffic — this is not a real outage.
            log.warn("Heartbeat job '{}' failed (demo)", scenario, ex);
            Sentry.captureException(ex);
        }
    }

    private void simulate(String scenario) {
        if (ThreadLocalRandom.current().nextInt(FAIL_ONE_IN) == 0) {
            throw new IllegalStateException("Simulated failure during " + scenario);
        }
    }
}
