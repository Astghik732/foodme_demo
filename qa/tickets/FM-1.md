**Key:** FM-1
**Type:** Bug
**Priority:** Medium
**Component:** Storefront / Checkout
**Reporter:** support@foodme.example (relaying a customer email)
**Status:** Open

## Description

A customer wrote in saying the total she was charged didn't match what she
expected from her cart. She'd ordered three dishes and says "the math doesn't
add up, it's off by a small amount, like a few drams here and there." She
attached a screenshot of her cart before checkout showing three line items.

## Steps to reproduce

1. Go to a chef's menu page.
2. Add at least 3 different dishes to the cart, in varying quantities.
3. Note the subtotal shown in the cart.
4. Proceed to checkout and place the order with cash payment.
5. Compare the `totalPrice` on the order confirmation screen to the subtotal
   noted in step 3 (plus delivery fee).

## Expected vs actual

**Expected:** the confirmed order total equals the sum of (price × quantity)
for every line, plus the delivery fee.

**Actual:** the confirmed total is consistently a little lower than the
cart's displayed subtotal plus delivery fee once three or more items are in
the cart. The discrepancy grows with more line items and looks like it's per
line, not a one-time rounding.

## Environment

Storefront, production-like build, reproduced on both desktop Chrome and
mobile Safari. Not tied to a specific chef or dish.
