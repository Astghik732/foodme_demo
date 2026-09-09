**Key:** FM-9
**Type:** Feature request
**Priority:** Low
**Component:** Storefront / Chef page
**Reporter:** product@foodme.example
**Status:** Open

## Description

Several chefs asked whether the chef page could show customers roughly how
long delivery takes, since "how long will it take" is one of the most common
questions they get before an order is even placed.

## Steps to reproduce

N/A — feature request.

## Expected vs actual

**Expected:** the chef page gives customers a rough delivery time estimate
before they order.

**Actual:** no delivery time information is shown anywhere in the ordering
flow.

## Acceptance criteria

- The chef page shows an estimated delivery time range (e.g. "35–50 min")
  near the delivery fee.
- The estimate is configurable per chef by an admin (a new editable field on
  the chef record), not hardcoded.
- When a chef has no estimate configured, the delivery time element is
  omitted rather than showing a placeholder like "TBD" or "0 min".
- Takeaway orders show a separate "ready for pickup in ~X min" estimate
  instead of a delivery estimate, when the chef supports takeaway.

## Environment

Requires a backend field (chef record + admin edit form) in addition to the
storefront display — flagged for both teams during grooming.
