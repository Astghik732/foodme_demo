# Checkout

## Summary

Checkout collects delivery details and payment method, submits the order, and
takes the customer to a confirmation screen with a trackable order number.
FoodMe supports cash on delivery only — there is no online payment.

Backed by `POST /api/auth/register`, `POST /api/auth/login`,
`POST /api/order`, `POST /api/order/delivery-price`, and
`GET /api/order/number/{number}`. Signed-in customers also use
`GET /api/customer/orders` for history.

## User stories

**US-1.** As a customer, I want to enter my delivery details and confirm my
order, so the chef receives it and I know it went through.

**US-2.** As a customer, I want to choose delivery or takeaway, so I can pick
up the order myself if that's more convenient.

**US-3.** As a customer, I want a record of my order I can check on later, so
I can follow its status without contacting the chef directly.

**US-4.** As a customer, I want to sign in or create an account when I order,
so I can track the current order and see my previous ones.

## Acceptance criteria

### AC-1 — Delivery method

1.1. Checkout offers a choice between `DELIVERY` and `TAKEAWAY`, limited to
the methods the chef supports (`deliveryMethods` from the chef page).

1.2. Choosing `DELIVERY` reveals the address form (AC-2) and includes the
chef's delivery fee (or free delivery, per `03-cart.md`) in the total.

1.3. Choosing `TAKEAWAY` hides the address form and excludes any delivery fee
from the total.

### AC-2 — Delivery details

2.1. For `DELIVERY`, the customer provides: city, street, building, apartment
(optional), and an optional note for the courier — mapped to `addressDto`.

2.2. The customer provides a receiver name, phone number, and email —
mapped to `receiverName`, `receiverPhoneNumber`, `receiverEmail`.

2.3. Phone number is validated to a plausible Armenian mobile format before
submission is allowed.

2.4. All required fields (city, street, building, receiver name, receiver
phone) must be filled before the "Place order" button is enabled.

### AC-3 — Payment

3.1. Checkout presents cash on delivery as the only selectable payment
option, pre-selected, matching `paymentType: "CASH"`.

3.2. No other payment method is presented in the UI (no card, no online
wallet) — the backend only accepts `CASH` and rejects anything else with an
error.

### AC-4 — Order note

4.1. The customer may add a free-text note to the order (mapped to `note`),
shown to the chef alongside the order.

### AC-5 — Placing the order

5.1. Submitting checkout calls `POST /api/order` with a customer JWT and the
cart's dishes as `createOrderDishes` (`dishId`, `quantity`), the chosen
delivery method, address (if applicable), and contact details. The "Place
order" button stays disabled until the customer is signed in.

5.2. While the request is in flight, the "Place order" button is disabled to
prevent duplicate submissions.

5.3. On success, the customer is taken to `/orders/success` showing the
returned order `number`, `status`, and `totalPrice`, and the cart is cleared.

5.4. On failure, the customer sees an inline error and remains on the
checkout page with their entered details preserved, so they can correct and
resubmit.

### AC-6 — Order confirmation and tracking

6.1. After a successful order, the customer receives a confirmation email at
the address they provided (`receiverEmail`), summarizing the order number,
items, and total, so they have a record even if they close the browser tab.

6.2. The success screen links to `/tracking/<number>`, which calls
`GET /api/order/number/{number}` and shows the order's current status
(`NEW`, `ACCEPTED`, `DELIVERED`, or `REJECTED`) along with the items ordered.

6.3. The tracking page is reachable at any time by re-entering the order
number, without needing an account.

### AC-7 — Account at checkout

7.1. Checkout shows only a sign-in / create-account panel if the customer is
not already authenticated — delivery, payment, and the order summary stay
hidden. After success, the rest of checkout appears and empty contact
fields are filled from the account profile.

7.2. A signed-in customer can open `/orders` to see their order history
(number, chef, status, total) and jump to `/tracking/<number>`.

7.3. Dedicated `/login` and `/register` pages sign the customer in and
return them to the `next` path (checkout, orders, or the page they left).
