**Test case:** TC-10 — Tracking page shows the order's current status by number
**Folder:** Checkout
**Type:** Manual
**Priority:** Medium
**Labels:** checkout, tracking, regression

## Preconditions

- Admin access to change an order's status.
- A freshly placed order, its number noted from the confirmation screen.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Place an order and note the returned order number. | Order confirmation shows `status: NEW`. |
| 2 | Go to `/tracking/<number>` on the storefront. | Page shows `NEW` status and the items ordered, matching what was submitted. |
| 3 | In the admin app, move the order from `NEW` to `ACCEPTED`. | Admin confirms the transition succeeded. |
| 4 | Reload the tracking page. | Status now shows `ACCEPTED`. |
| 5 | In admin, move the order to `DELIVERED`. Reload tracking. | Status shows `DELIVERED`. |
