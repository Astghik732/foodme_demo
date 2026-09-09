**Key:** FM-5
**Type:** Bug
**Priority:** Low
**Component:** Storefront / Cart
**Reporter:** j.petrosyan (customer)
**Status:** Closed — Not a bug

## Description

Customer reported that their cart "just disappeared" — they'd added several
dishes, closed the browser to check something, and came back to an empty
cart. They were browsing in a private/incognito window at the time (mentioned
in a follow-up reply, not in the original report).

## Steps to reproduce

1. Open the storefront in a private/incognito browser window.
2. Add dishes to the cart.
3. Close the private window entirely (not just the tab).
4. Reopen a new private window and go back to the storefront.

## Expected vs actual

**Expected (reporter):** the cart should still have their items.

**Actual:** the cart is empty.

## Environment

Private/incognito browsing session, browser not specified by reporter.

## Triage notes

The cart is stored in the browser's local storage (IndexedDB), which most
browsers wipe entirely when a private/incognito window is closed — that's a
property of private browsing, not a defect in FoodMe. A normal (non-private)
window was tested separately and the cart persisted correctly across a full
browser restart. Closing as not a bug; replied to the customer explaining
that private windows don't retain site data after closing.
