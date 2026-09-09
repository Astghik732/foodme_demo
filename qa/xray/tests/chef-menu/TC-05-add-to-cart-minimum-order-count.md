**Test case:** TC-05 — Dish modal respects minimum order count when adding to cart
**Folder:** Chef Menu
**Type:** Manual
**Priority:** Medium
**Labels:** chef-page, cart, regression

## Preconditions

- Seed dataset loaded.
- A dish with `minimumOrderCount` greater than 1, if available; otherwise use
  the default of 1.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Open a chef's menu and click a dish card. | The dish detail modal opens. |
| 2 | Observe the initial quantity in the modal. | Equals the dish's `minimumOrderCount` (or 1 if unset). |
| 3 | Attempt to decrease the quantity below `minimumOrderCount`. | The quantity selector does not go below the minimum. |
| 4 | Increase the quantity by 2 and confirm the line total shown. | Line total equals `price × quantity`. |
| 5 | Click "Add to cart". | The modal closes; the cart now contains this dish at the selected quantity. |
