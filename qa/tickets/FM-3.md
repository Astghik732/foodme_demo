**Key:** FM-3
**Type:** Bug
**Priority:** Medium
**Component:** Backend / Orders
**Reporter:** chef-support (relaying multiple chef complaints)
**Status:** Open

## Description

A couple of chefs have mentioned that the order times shown to them don't
line up with when they say the order actually came in. One chef said an order
that came in "right after we opened at 10am" showed up with a much earlier
timestamp when she checked it later. Nobody's been able to pin down exactly
when it happens, just that the displayed time feels shifted.

## Steps to reproduce

1. Place an order at a known local time.
2. Note the wall-clock time of submission.
3. Look up the order (tracking page or admin order view) and check the
   displayed `createdAt` time.
4. Compare to the actual time the order was placed.

## Expected vs actual

**Expected:** the timestamp shown for an order matches the time it was
actually placed, in a clearly-labeled and consistent timezone.

**Actual:** the displayed time is offset from the actual submission time by
a fixed number of hours. The offset looks consistent, not random, which
suggests a timezone handling issue rather than a display bug per order.

## Environment

Reported by chefs using the admin order view; also visible on the customer
tracking page. Offset has been observed on the demo/staging environment; not
yet confirmed against server locale settings.
