---
name: jira
description: Work with this project's Jira (project key KAN) via the Atlassian MCP — file bug reports from a fixed Steps/Expected/Actual template, search and update issues, and set the ticket's priority based on your own review of the bug's severity rather than leaving it at a default. Use when asked to file a Jira bug, create/update/search a Jira ticket, link a fix to its ticket, or triage/re-prioritize an issue.
---

# Working with Jira (project `KAN`)

This repo's real Jira project key is **`KAN`** — visible in commit messages like
`fix(cart): ... (KAN-4)`. Don't confuse this with the `FM-BUG-##` / `FM-FLAKE-##` tags
that show up in source comments (e.g. `// FM-BUG-07` in `apps/web/e2e/cart-decrement.spec.ts`)
— those are this workshop repo's own internal labels for intentionally-seeded bugs, not
Jira keys (a real Jira key is always `PROJECT-<number>`; `FM-BUG-07` isn't numeric after
the dash, so it never is one). A seeded workshop bug may or may not have a matching `KAN-`
ticket — check before assuming.

## Tool access

All Jira work here goes through the claude.ai Atlassian MCP:
- `getJiraIssue`, `searchJiraIssuesUsingJql`, `createJiraIssue`, `editJiraIssue`,
  `addOrEditJiraIssueComment`, `transitionJiraIssue` are primary tools — call directly.
- `getAccessibleAtlassianResources` once per session (if no site context yet) to get
  `cloudId`; pass it as a **top-level** argument on every `execute*` call, never inside
  `inputs`.
- `atlassianUserInfo` gets the current user's `accountId` (for `reporter`/`assignee`).
- For anything not in the primary list (e.g. bulk field updates, workflow-specific
  transitions), call `discover` first with a description of the goal, then run the
  returned operation via `executeRead`/`executeWrite`/`executeDestructive` matching its
  risk tier — never guess an operation name.
- **Priority field values are site-specific** (`Highest/High/Medium/Low/Lowest` is the
  Jira default, but this site may use a different scheme, e.g. `Blocker/Critical/Major/
  Minor/Trivial`). Before setting priority on the first ticket in a session, read an
  existing `KAN-*` issue with `view: "full"` (or `discover` the priority field) to see
  the actual allowed values for this site — don't assume the default scheme.

## Bug report template

When filing a bug, use `createJiraIssue` with `issueType: "Bug"` and build the
`description` from this fixed template — always these three sections, in this order,
even if one is short:

```
**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
...

**Actual Result:**
...

**Environment:**
... (app: backend / web / admin; branch or commit SHA; profile/env if relevant)
```

- `Summary`: one line, symptom-focused ("Admin chef update returns 500" not "Chef bug").
- `Steps to Reproduce`: concrete and reproducible — exact request/URL/command, not
  "try to edit a chef." If you found this via a test, the test *is* the steps: point to
  the file/method (e.g. "run `AdminChefControllerTest.update_changesNameEn_persists`").
- `Expected Result` / `Actual Result`: state both even when the actual result seems
  obvious — a reviewer shouldn't have to infer the expectation.
- Attach evidence where possible: a stack trace, failing assertion text, or a short
  excerpt of the relevant log/response body, inline in the description (fenced code
  block) rather than just a vague description.

## Setting priority — always a deliberate call, never the default

Don't leave priority at whatever Jira defaults to, and don't guess. Before creating or
re-prioritizing a bug, review it yourself and set priority based on actual impact:

| Signal | Typical priority |
|---|---|
| Data loss/corruption, security hole, or breaks a core flow for all users with no workaround (e.g. every real admin edit 500s) | Highest / Blocker |
| Breaks a main flow for most users, or a workaround exists but is painful | High / Critical |
| Real bug, impacts a subset of users or a secondary flow | Medium / Major |
| Cosmetic, edge-case, or very narrow repro conditions | Low / Minor |
| Trivial/typo-level, no functional impact | Lowest / Trivial |

Steps:
1. Form your own judgment first — reproduce it if you can (run the relevant test, hit
   the endpoint), read the code path, check whether it's user-facing or an edge case.
   Don't just mirror the reporter's stated severity.
2. Set/update the field via `editJiraIssue` (`fields: { priority: { name: "<value>" } }`
   — field name confirmed from the site's actual scheme, see above).
3. **Always leave a comment explaining the call** via `addOrEditJiraIssueComment` — one
   or two sentences: what you checked and why that priority. e.g. "Reviewed: this 500s
   on every real `PUT /admin/chef/{id}`, not just the test fixture (Hibernate
   orphanRemoval conflict on `chefTagOrderList`) — every admin chef edit is broken with
   no workaround. Set to Highest." A priority change with no rationale comment is not
   useful to whoever reads the ticket next.
4. If you're not confident enough to set a firm priority (can't reproduce, impact
   unclear), say so in the comment and pick the closer of the two plausible levels
   rather than leaving it unset — note what evidence would resolve the ambiguity.

## Before creating a new ticket

Search first (`searchJiraIssuesUsingJql`, e.g. `project = KAN AND text ~ "chef update"`)
to avoid filing a duplicate. If a close match exists, prefer commenting on it (with your
new evidence) over opening a second ticket — only split into a new ticket if the bug is
genuinely distinct.

## Linking fixes back to tickets

This repo's commit convention references the ticket key in parentheses at the end of
the subject line, e.g. `fix(cart): decrement lowers quantity by one (KAN-4)` — follow
that convention for any commit that closes or addresses a `KAN-*` ticket, and consider
`transitionJiraIssue` to move the ticket's status once the fix actually lands (don't
transition on the basis of a draft/unverified fix).
