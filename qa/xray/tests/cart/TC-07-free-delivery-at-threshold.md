**Test case:** TC-07 — Delivery is free once the subtotal reaches the free-delivery threshold
**Folder:** Cart
**Type:** Manual
**Priority:** High
**Labels:** cart, pricing, boundary, regression

## Preconditions

- Seed dataset loaded.
- A chef with a known `deliveryPrice` and `freeDeliveryFrom` (e.g. chef
  `marta-k`: `deliveryPrice: 700`, `freeDeliveryFrom: 8000`).

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Add dishes from the chef to the cart until the subtotal is exactly equal to `freeDeliveryFrom` (e.g. exactly 8,000 ֏). | Cart subtotal reads exactly the threshold value. |
| 2 | Observe the delivery fee line in the cart for a `DELIVERY` order. | Delivery is shown as free ("Free" / 0 ֏). |
| 3 | Proceed to checkout with `DELIVERY` selected and place the order. | `POST /api/order`'s response `totalPrice` equals the dish subtotal only (no delivery fee added). |
| 4 | Repeat with a subtotal one unit below the threshold. | Delivery fee is charged. |
| 5 | Repeat with a subtotal one unit above the threshold. | Delivery is free. |

## Notes

Step 1–3 test the exact-threshold boundary. If the cart display and the
checkout total disagree with each other at exactly the threshold, or if the
displayed cart behavior at step 2 doesn't match the final charged amount at
step 3, record both observed values — this boundary has been a source of
conflicting expectations in the past and is worth double-checking against
whichever spec/AC the team currently treats as authoritative.
