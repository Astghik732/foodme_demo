**Key:** FM-8
**Type:** Feature request
**Priority:** Low
**Component:** Storefront / Checkout
**Reporter:** product@foodme.example
**Status:** Open

## Description

Repeat customers re-type their full delivery address every time they order,
since FoodMe has no accounts. Offer to remember the last-used delivery
details in the browser so returning customers can check out faster.

## Steps to reproduce

N/A — feature request.

## Expected vs actual

**Expected:** after a successful order, the customer's delivery details are
offered as a starting point the next time they check out on the same
browser/device.

**Actual:** every checkout starts from a blank delivery form, even
immediately after a previous order from the same browser.

## Acceptance criteria

- After a successful order, the receiver name, phone, email, and address are
  saved to browser storage (no account, no server-side storage).
- On a later visit, the checkout form is pre-filled from the saved details,
  clearly editable, with a way to clear the saved details.
- Saved details are never sent anywhere except as part of an explicit order
  submission the customer initiates.
- Pre-filled details do not bypass the existing required-field validation
  (`04-checkout.md`, AC-2) — an incomplete saved address still blocks
  submission until corrected.

## Environment

Storefront only; purely client-side, no backend change expected.
