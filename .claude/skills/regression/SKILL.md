---
name: regression
description: Run the full FoodMe regression suite (backend JUnit, web/admin Playwright E2E) and report real pass/fail with evidence. Use when asked to run regression, run all tests, verify nothing broke, or check CI-equivalent results locally before a PR.
---

# Running the FoodMe regression suite

Three independent suites, run from each app's own directory. There is no single
root command that runs all of them.

## Backend — `apps/backend`

```
cd apps/backend
./gradlew test                 # whole suite
./gradlew test --tests "FooTest" --tests "BarTest"   # just the classes you touched
```

Reports:
- Human-readable: `apps/backend/build/reports/tests/test/index.html`
- Machine-readable: `apps/backend/build/test-results/test/TEST-<ClassName>.xml` — grep
  these directly for `<failure message="...">` to get the assertion text and
  `Resolved Exception` / response body without opening the HTML report.

**Known environment gap**: `apps/backend/gradle/wrapper/gradle-wrapper.jar` is not
committed to this repo (despite `.gitignore` trying to force-include it), so
`./gradlew` fails with `Could not find or load main class
org.gradle.wrapper.GradleWrapperMain` on a fresh checkout with no system Gradle
installed. Workaround (don't modify repo files to fix this — it's a checkout gap,
not something to patch):

```bash
# one-time per session, into the scratchpad dir, not the repo
curl -L -o gradle-8.6-bin.zip https://services.gradle.org/distributions/gradle-8.6-bin.zip
unzip -q gradle-8.6-bin.zip
# use the extracted binary directly in place of ./gradlew, same args:
<scratchpad>/gradle-8.6/bin/gradle.bat --no-daemon -p apps/backend test
```
Match the Gradle version to `apps/backend/gradle/wrapper/gradle-wrapper.properties`
(`distributionUrl`) in case it's bumped later.

## Web storefront — `apps/web`

```
cd apps/web
npm run test:e2e        # full Playwright suite; boots its own dev server on :5180
npm run test:e2e:all    # this suite, then apps/admin's, back to back
```

Report: `apps/web/playwright-report/index.html` (`npx playwright show-report` opens it).

## Admin backoffice — `apps/admin`

```
cd apps/admin
npm run test:e2e        # boots its own dev server on :5174
```

Report: `apps/admin/playwright-report/index.html`.

## Interpreting failures — don't just say "tests failed"

1. **Pull the actual assertion/exception**, not just the test name — for backend,
   grep the XML in `build/test-results/test/` for `<failure message=` and the
   `Resolved Exception` / response body in the MockMvc debug dump; for Playwright,
   read the HTML report's error context, not just the summary line.
2. **Check for a known seeded bug/flake before calling it a regression.** This repo
   intentionally ships tests that encode pre-existing workshop bugs, marked with a
   comment like `// FM-BUG-07` or `// FM-FLAKE-03` right above the test (see
   `DishControllerTest`, `OrderControllerTest`, `apps/web/e2e/cart-decrement.spec.ts`,
   `apps/web/e2e/flake-*.spec.ts`). A failure there may be expected/by design — read
   the comment and the test name before treating it as something your change broke.
3. **A failure with no such comment, on a test that isn't already known-flaky, is a
   real regression.** Report it with the file/line and the actual error — don't
   "fix" the test to make it pass by matching broken behavior, and don't silently
   skip or delete it. Surface it; let the human decide whether the test or the
   production code is wrong.
4. Summarize as a pass/fail count plus one line per failure (file:line — assertion),
   not a wall of raw Gradle/Playwright output.
