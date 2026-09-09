# Cart

## Summary

The cart holds the dishes a customer has selected from a single chef, shown
as a sticky panel while browsing the menu and as a full view before checkout.
It is stored client-side (no account needed) and survives a page refresh.

Backed by `POST /api/order/delivery-price` for delivery estimation; dish
prices come from the DTOs already loaded on the chef page (`02-chef-menu.md`).

## User stories

**US-1.** As a customer, I want to see everything I've added to my cart with
a running total, so I know what I'm about to pay before I check out.

**US-2.** As a customer, I want to adjust quantities or remove items from the
cart, so I can fix mistakes without starting over.

**US-3.** As a customer, I want to see the delivery fee and know how close I
am to free delivery, so I can decide whether to add another item.

## Acceptance criteria

### AC-1 — Cart contents

1.1. The cart lists each distinct dish as one line: image, name, unit price,
quantity, and line total (`price × quantity`).

1.2. The cart shows a subtotal: the sum of all line totals.

1.3. The cart persists across a page reload and across navigation within the
site (browser storage), and is cleared only on successful checkout or an
explicit "clear cart" action.

### AC-2 — Quantity changes

2.1. Each line has quantity controls (increment/decrement, or a numeric
input) that update the line total and subtotal immediately.

2.2. Decrementing a line's quantity below the dish's `minimumOrderCount`
removes the line from the cart (with confirmation), rather than allowing a
quantity below the minimum.

2.3. Removing the last line in the cart returns the customer to an empty-cart
state.

### AC-3 — Delivery fee display

3.1. For a `DELIVERY` order, the cart shows the chef's delivery fee
(`deliveryPrice`) as a separate line from the dish subtotal.

3.2. **Once the cart subtotal reaches the chef's `freeDeliveryFrom` amount,
delivery is free** and the delivery fee line shows "Free" instead of the
fee amount. For example, a chef with `freeDeliveryFrom: 8000` shows free
delivery once the subtotal reaches exactly 8,000 ֏.

3.3. The cart shows a progress hint below the free-delivery threshold, e.g.
"Add 1,200 ֏ more for free delivery," computed as `freeDeliveryFrom -
subtotal`. This hint disappears once delivery is free.

3.4. **Delivery is free only when the cart subtotal exceeds the chef's
`freeDeliveryFrom` amount — reaching the threshold exactly still incurs the
delivery fee**, matching the strict comparison the backend uses when it
recomputes the total at checkout.

3.5. For a `TAKEAWAY` order, no delivery fee is shown and the free-delivery
hint (AC-3.3) does not apply.

### AC-4 — Cart total

4.1. The cart shows a grand total: subtotal plus the applicable delivery fee
(zero when free or takeaway).

4.2. The total shown in the cart is an estimate for display only; the
authoritative total is the one returned by `POST /api/order` at checkout,
computed server-side from current dish prices and delivery rules.

### AC-5 — Empty cart

5.1. An empty cart shows a message inviting the customer back to Explore, and
hides the checkout entry point.
