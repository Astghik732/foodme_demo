# FoodMe — Xray test repository (starter)

This is a starter manual test repository for FoodMe's storefront flow,
structured to import into **Xray Test Management for Jira Cloud** and to be
read directly as Markdown without any tooling at all.

## Structure

```
qa/xray/
  README.md          this file
  xray-import.json    scripted GraphQL payloads to create the tests in Xray
  tests/
    chef-listing/     TC-01, TC-02
    chef-menu/        TC-03, TC-04, TC-05
    cart/              TC-06, TC-07
    checkout/          TC-08, TC-09, TC-10
```

Each folder corresponds to a feature and to one spec in `docs/requirements/`
(`chef-listing` ↔ `01-chef-listing.md`, and so on). Each test case is one
Markdown file: a header block (test case id, folder, type, priority, labels)
followed by a numbered steps table with expected results per step — the same
information Xray stores per manual test step (`action` / `data` / `result`).

Ten test cases ship here, covering the main flow end to end: browsing active
chefs, opening a chef's menu, adding to cart, and checking out. This is a
starting point, not full coverage — students are expected to grow it.

## Importing into Xray Cloud

Xray Cloud does not have a single bulk "create these manual tests from one
JSON file" REST endpoint. There are two supported ways to get tests into
Xray, verified against Xray's own documentation:

1. **CSV import (simplest, no scripting)** — in the Jira project's Test
   Repository, use **Import** → **CSV**. Xray's CSV importer maps columns to
   Jira/Xray fields (summary, test type, steps, labels, etc.) via an on-screen
   field mapping you configure at import time. This is the fastest path for
   a one-off seed of test cases and works from the Markdown files directly
   (copy the steps into a spreadsheet) or from a CSV you derive from this
   folder.

2. **GraphQL API (scriptable, what `xray-import.json` targets)** — Xray Cloud
   exposes a GraphQL API at `https://xray.cloud.getxray.app/api/v2/graphql`
   with a `createTest` mutation that accepts a test type, an array of manual
   steps (`action`, `data`, `result`), and standard Jira fields (`project`,
   `summary`, `labels`) under `jira.fields`. `xray-import.json` in this
   folder holds one ready-to-use `variables` payload per test case above,
   keyed by the same `TC-xx` id used in the Markdown files.

   Authenticate first, then call the mutation once per test case:

   ```bash
   # 1. Get a token (client id/secret come from an Xray API Key,
   #    created in Jira: Apps → Xray → API Keys)
   TOKEN=$(curl -s -H "Content-Type: application/json" \
     -X POST -d "{\"client_id\":\"$XRAY_CLIENT_ID\",\"client_secret\":\"$XRAY_CLIENT_SECRET\"}" \
     https://xray.cloud.getxray.app/api/v2/authenticate | tr -d '"')

   # 2. For each entry in xray-import.json, POST its `variables` alongside
   #    the createTest mutation. A short loop (jq + curl, or any scripting
   #    language) reads the file and issues one call per test case:
   curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -X POST https://xray.cloud.getxray.app/api/v2/graphql \
     -d '{"query":"mutation($testType: UpdateTestTypeInput!, $steps: [CreateStepInput], $jira: JSON!){ createTest(testType:$testType, steps:$steps, jira:$jira){ test { issueId jira(fields:[\"key\"]) } warnings } }", "variables": <one entry from xray-import.json>.variables}'
   ```

   This project intentionally doesn't ship the loop script itself (the exact
   shape depends on which scripting tool a session standardizes on — this is
   Session 4/5 territory), only the payloads to feed it.

   `XRAY_CLIENT_ID` / `XRAY_CLIENT_SECRET` come from an Xray API Key
   (Jira → Apps → Xray → API Keys), never the Jira account password. Keep
   them in environment variables, never committed.

3. Whichever path you use, the created Test issues land in the `FM` Jira
   project and can be organized into the Test Repository folders shown above
   from the Xray UI (**Test Repository** → **New Folder**), or associated
   with a Test Plan/Test Execution for a session's run.

## Running these manually without Xray

The Markdown files under `tests/` are complete on their own — every step and
expected result is inline. A tester (human or an agent) can execute any
`TC-xx.md` directly against a running FoodMe stack without touching Jira at
all; import into Xray is only needed once the course gets to Session 4's
test-management walkthrough.
