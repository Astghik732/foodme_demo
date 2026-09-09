**Key:** FM-4
**Type:** Bug
**Priority:** High
**Component:** Storefront / Order tracking
**Reporter:** anonymous (submitted via contact form)
**Status:** Open

## Description

"I was checking on my order using the tracking link and noticed the order
number in the URL is just a number that goes up. I changed the last couple
digits to see what would happen and it showed me a full order — name, phone
number, address, what was ordered — for what I'm pretty sure was a total
stranger. I didn't do anything else, just wanted to flag it before someone
does something worse with it."

## Steps to reproduce

1. Place an order and note the order number and tracking URL
   (`/tracking/<number>`).
2. Edit the number in the URL to a nearby value (increment or decrement by a
   small amount).
3. Load the resulting tracking page.

## Expected vs actual

**Expected:** a tracking link only shows order details to someone who has
some proof they're associated with that order (e.g. it was emailed to them,
or some other check confirms it's theirs).

**Actual:** any guessed or incremented order number that happens to exist
returns the full order details — name, phone, address, items — with no
check that the requester has any connection to that order.

## Environment

Reported against the public tracking page on the storefront; the same
number pattern is visible in order confirmation emails and URLs, so it's
easy to guess adjacent numbers.
