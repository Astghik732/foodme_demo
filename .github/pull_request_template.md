## What and why
<!-- What does this PR change, and why? Link the Jira ticket, e.g. KAN-5. -->

## How to test
<!-- Steps a reviewer can follow, or the tests that cover it. -->

## Checklist
- [ ] Backend tests added/updated (`apps/backend/src/test/testCases`)
- [ ] Playwright specs added/updated for UI changes (`apps/web/e2e`, `apps/admin/e2e`)
- [ ] New DB changes use a new Flyway migration (no edits to applied ones)
- [ ] No secrets, tokens or credentials committed
- [ ] Commit/PR title references the Jira key, e.g. `(KAN-5)`

> Claude reviews every PR automatically (code review + test review). Comment `@claude <question>` to ask it for more.
