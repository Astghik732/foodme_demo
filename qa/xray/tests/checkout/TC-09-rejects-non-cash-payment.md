**Test case:** TC-09 — Order creation rejects any payment type other than cash
**Folder:** Checkout
**Type:** Manual
**Priority:** High
**Labels:** checkout, api, regression

## Preconditions

- A valid order payload for an active chef and active dish(es).
- API access (e.g. `curl`, Postman) to `POST /api/order`.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Submit a valid order via the storefront checkout UI. | The UI never presents any payment option other than cash; the request sent has `paymentType: "CASH"` and succeeds. |
| 2 | Submit `POST /api/order` directly with `paymentType: "CARD"` (same otherwise-valid payload). | Response is `400` with a message indicating only cash payment is supported. |
| 3 | Submit `POST /api/order` with `paymentType` omitted entirely. | Response is `400` (validation error), order is not created. |
| 4 | Confirm no order was created for steps 2–3. | `GET /api/order/number/{number}` for any number generated in this test session shows only the one order from step 1. |
