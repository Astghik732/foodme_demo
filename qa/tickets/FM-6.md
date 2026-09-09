**Key:** FM-6
**Type:** Bug
**Priority:** Low
**Component:** Storefront / Chef page · Admin
**Reporter:** internal QA (weekly spot-check)
**Status:** Closed — Not a bug

## Description

While spot-checking chef data, QA noticed a chef's rating shows as `4.8` on
the storefront chef page, but the admin app's chef edit form shows the
underlying value as `4.75`. Flagged as a possible data sync issue between the
storefront and the admin.

## Steps to reproduce

1. In the admin app, open a chef whose rating has two decimal places of
   precision (e.g. `4.75`).
2. Open the same chef's page on the storefront.
3. Compare the rating shown on each.

## Expected vs actual

**Expected (reporter):** both surfaces should show the same rating value.

**Actual:** the storefront shows `4.8`, the admin shows `4.75`.

## Environment

Compared on the same environment/database, same chef record, back to back.

## Triage notes

Both are showing the same underlying value — the storefront intentionally
rounds ratings to one decimal place for display (per the chef listing spec),
while the admin form shows the raw stored value for editing purposes. This is
expected behavior, not a data mismatch. No underlying data issue found.
Closing as not a bug.
