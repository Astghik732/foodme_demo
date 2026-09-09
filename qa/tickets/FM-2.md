**Key:** FM-2
**Type:** Bug
**Priority:** Low
**Component:** Storefront / Cart
**Reporter:** a.sargsyan (customer, via contact form)
**Status:** Open

## Description

Customer says they added up their order to land exactly on the "free over
8000 ֏" line shown on the chef's page, on purpose, and still got charged
delivery. They're annoyed because they specifically added an extra drink to
hit the number they saw advertised.

## Steps to reproduce

1. Open a chef whose page advertises a free-delivery threshold (e.g. "free
   delivery over 8,000 ֏").
2. Add dishes until the cart subtotal is exactly equal to that threshold
   value (not more, not less).
3. Proceed to checkout with `DELIVERY` selected.

## Expected vs actual

**Expected:** per the price shown on the chef page ("free over 8,000 ֏"),
reaching that subtotal should make delivery free.

**Actual:** delivery is still charged when the subtotal exactly equals the
threshold. It only becomes free once the customer adds something extra to go
over it.

## Environment

Reproduced on the storefront cart view and confirmed again at the checkout
total, so it isn't just a display glitch in the cart estimate — the final
charged amount also includes delivery at exactly the threshold value.
