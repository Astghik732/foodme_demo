---
name: reviewing-test-cases
description: Review test cases (JUnit/MockMvc backend tests, Playwright E2E specs, or written manual test cases such as the ones in Qase) against ISTQB review criteria and report findings, with inline code comments on a pull request when a specific line needs one. Use when asked to review tests or test cases, check test coverage of a change, review a PR's tests, or give QA feedback on test design.
---

# Reviewing test cases (ISTQB-based)

Review tests the way an ISTQB-trained reviewer would: against the **test basis** (the
requirement, Jira story, or code behavior being tested), using a defined checklist, and
reporting **defects with severity** rather than vague opinions. For how tests in this repo
are *written*, see [[writing-tests]]; this skill is about *judging* them.

## 1. Pick the review type and scope

Per ISTQB Foundation (ch. 3, static testing), choose what fits and say which you used:

| Type | Use when |
|---|---|
| **Informal review** | Quick feedback on a small test change, no formal process |
| **Walkthrough** | Author explains tests to others; goal is learning/understanding |
| **Technical review** | Judging fitness of the tests against the test basis and standards |
| **Inspection** | Formal, checklist-driven, with defect metrics - for critical areas |

Default for a PR or "review my tests" request: **technical review** with an inspection-style
checklist (section 3).

Scope = the tests in the diff/files given, plus whatever test basis they claim to cover.
Do not review production code here (that is the code-review job); read it only to judge
whether the test checks the right behavior.

## 2. Process (ISTQB review activities)

1. **Planning** - identify the test files/cases under review and the test basis (Jira
   story, PRD such as `order-ratings.spec.md`, API contract, PR diff). Fetch the Jira
   ticket with the `jira` skill if a key like `KAN-5` is mentioned.
2. **Review initiation** - read the changed tests in full; read the code under test and
   the repo conventions (`.claude/skills/writing-tests/SKILL.md`, `.agents/rules/*.md`).
3. **Individual review** - walk the checklist in section 3 for each test; note anomalies.
4. **Communication and analysis** - classify each anomaly (section 4); drop false
   positives; merge duplicates.
5. **Fixing and reporting** - produce the report (section 6) and, where useful, inline
   comments (section 5).

## 3. Review criteria (checklist)

### 3.1 Traceability and coverage
- Each test maps to a requirement/acceptance criterion/behavior; each requirement has at
  least one test (build a coverage map: behavior -> test -> covered?).
- Both **positive and negative** paths: valid input, invalid input, missing auth, wrong
  owner/permissions, duplicates, wrong state.
- Applicable **test design techniques** are used and complete:
  - **Equivalence partitioning** - one test per valid and invalid partition.
  - **Boundary value analysis** - min, max, just inside, just outside (e.g. 0/1/5/6 stars,
    1000/1001 chars).
  - **Decision tables** - every meaningful combination of conditions (rules evaluated in
    order, e.g. auth -> ownership -> state -> validation).
  - **State transition** - valid transitions and attempted invalid ones (NEW -> ACCEPTED ->
    DELIVERED; REJECTED is final).
  - **Experience-based/error guessing** - concurrency, double submit, empty/null, very long
    or special-character input, timezone/date edges.
- Non-functional aspects the story names (accessibility, mobile viewport, performance) have
  tests or an explicit note why not.
- Regression: existing behavior touched by the change is still covered.

### 3.2 Test case content (for written cases and for test code alike)
- **Unique, descriptive title** that states scenario and expected outcome
  (`method_scenario_expectedResult` for JUnit).
- **Preconditions** and **test data** are stated or set up in the test; data is realistic.
- **Steps** are atomic, ordered, unambiguous, reproducible by someone else.
- **Expected result** is explicit and verifiable for each step - status code **and** body
  or message, UI state, persisted state (re-read after the action). Not just "no error".
- One test = one main objective (no "kitchen-sink" tests mixing unrelated checks).
- **Priority/severity and type** (functional, negative, boundary, regression) make sense.
- No duplicated or redundant tests that check the same thing without adding coverage.

### 3.3 Reliability and maintainability
- **Independent and repeatable**: no reliance on execution order, shared mutable state,
  global sequences (e.g. order numbers), or leftovers from other tests; unique data per run
  (emails with `UUID`/timestamp).
- **Deterministic**: no fixed sleeps, real clock/timezone assumptions, random without seed,
  external services. Flaky-by-design tests (`FM-FLAKE-*`) are flagged, not copied.
- Assertions cannot pass vacuously (e.g. looping over an empty list, an `if` that skips the
  `expect`, `catch` that swallows failures).
- Locators/selectors are robust (role/label based for Playwright), not brittle CSS/index.
- Setup/helpers are reused (`e2e/auth.ts`, existing `customerToken()` patterns) instead of
  copy-pasted; seed fixtures (`src/test/resources/data.sql`) are not edited to suit a test.
- Tests are **executed**: the test directory/config actually includes them (check build
  config, `testDir`, file naming) and they are not `@Disabled`/`skip`/`.only`.
- Test follows repo conventions in [[writing-tests]] (profile, annotations, helpers).

### 3.4 Test basis consistency
- Expected results match the requirement, **not just the current implementation** - flag
  tests that assert buggy behavior as correct, or that were weakened to make them pass.
- Messages, limits and status codes in tests equal those in the spec.

## 4. Classify findings

| Severity | Meaning | Examples |
|---|---|---|
| **Critical** | Test gives false confidence or required behavior is untested | Vacuous assertion; acceptance criterion with no test; tests never run; asserts wrong behavior |
| **Major** | Significant gap or reliability problem | Missing negative/boundary case; order-dependent or flaky; no persisted-state check |
| **Minor** | Quality/maintainability issue | Unclear title, duplicated setup, brittle locator, weak message assertion |
| **Suggestion** | Optional improvement | Extra edge case, helper extraction |

Tag each finding with the criterion it violates (e.g. "3.1 BVA", "3.3 independence") and
cite `path:line`.

## 5. Inline comments (when a specific line needs one)

Use an **inline comment** only when the problem is tied to a specific line or block of
test code (a weak assertion, a missing boundary in a data set, a brittle locator).
Whole-suite problems (missing scenarios, coverage gaps) go in the summary instead.

Choose the mechanism available:

1. **Inside the GitHub Actions workflow** (`claude-test-review.yml`): call
   `mcp__github_inline_comment__create_inline_comment` with the file path, line (and
   optional start line for a range) and the comment body.
2. **Locally with the GitHub CLI** for an open PR - post one review with line comments:
   ```
   gh api repos/{owner}/{repo}/pulls/{number}/reviews \
     --method POST \
     -f event=COMMENT \
     -f body="Test review summary" \
     -f 'comments[][path]=apps/backend/src/test/testCases/Foo.java' \
     -F 'comments[][line]=42' \
     -f 'comments[][side]=RIGHT' \
     -f 'comments[][body]=**Major - 3.1 BVA:** ...'
   ```
   Lines must be part of the PR diff (use the new-file line number, `side=RIGHT`). Get the
   head commit with `gh pr view <n> --json headRefOid`. Post comments to GitHub only when
   the user asked for the review to be posted; otherwise show them in chat.
3. **No PR / no `gh`**: give the same comments in chat as `path:line - comment`.

Inline comment format (keep each short and actionable):
```
**<Severity> - <criterion>:** <what is wrong, one sentence>.
Suggested: <the concrete fix or the missing case>.
```
Never post the same finding both inline and in the summary - the summary links to it by
`path:line`. Do not modify test files unless the user asks for fixes.

## 6. Report format

```
## Test review: <scope / PR / ticket>
Review type: technical review (ISTQB) | Test basis: <story/PRD/diff>

### Verdict
<Tests sufficient | Needs more tests | Tests unreliable> - one-sentence reason

### Coverage map
| Behavior / requirement | Covered by | Status |
|---|---|---|
| ... | `Class.method` / spec title | covered / partial / missing |

### Findings
| # | Severity | Criterion | Location | Finding | Suggested fix |
|---|---|---|---|---|---|

### Missing test cases
For each: title | preconditions | steps | expected result | priority

### Positive notes
<what is well done - keep brief>
```

Rules for a good review: be specific (`path:line`), prefer few high-signal findings over a
long list, separate defects from taste, never invent requirements - when the test basis is
unclear say so and ask rather than guess, and report only what you verified in the code.
