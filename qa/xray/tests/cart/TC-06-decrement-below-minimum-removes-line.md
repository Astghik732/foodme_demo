**Test case:** TC-06 — Decrementing below the minimum order count removes the cart line
**Folder:** Cart
**Type:** Manual
**Priority:** Medium
**Labels:** cart, regression

## Preconditions

- Seed dataset loaded.
- A dish with `minimumOrderCount: 1` added to the cart at quantity 1.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Open the cart with one dish line at quantity 1. | Line is visible with quantity 1. |
| 2 | Click the decrement control on that line. | A confirmation prompt appears (removing the last unit). |
| 3 | Confirm removal. | The line is removed from the cart. |
| 4 | If this was the only line in the cart, observe the cart state. | The cart shows the empty-cart state. |
