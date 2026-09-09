# Chef page and menu

## Summary

Clicking a chef from Explore opens that chef's page: a header with the chef's
details, and a menu of their dishes grouped by tag (Starters, Mains, Grill,
Vegetarian, Desserts, Drinks). Customers add dishes to the cart from here.

Backed by `GET /api/chef/{id}` (chef header + `dishes[]`) and
`GET /api/dish/tags?chefId=` (tag grouping and ordering).

## User stories

**US-1.** As a customer, I want to see a chef's details and story before I
order, so I know who I'm ordering from.

**US-2.** As a customer, I want the menu organized by category, so I can find
the kind of dish I'm in the mood for.

**US-3.** As a customer, I want to see a dish's details before adding it to my
cart, so I know what I'm ordering and how much it costs.

**US-4.** As a customer, I want to add dishes to my cart directly from the
menu, so ordering multiple items is quick.

## Acceptance criteria

### AC-1 — Chef header

1.1. The header shows the chef's banner (`bannerUrl`), avatar (`avatarUrl`),
display name (`name`, English value), cuisine (`kitchen`, English value),
rating (`rating`, one decimal place), and phone number (`phoneNumber`).

1.2. The header shows the delivery fee (`deliveryPrice`) and the free-delivery
threshold (`freeDeliveryFrom`) for this chef, e.g. "700 ֏ delivery · free
over 8000 ֏".

1.3. The header shows which delivery methods this chef supports
(`deliveryMethods`: `DELIVERY`, `TAKEAWAY`, or both).

### AC-2 — Menu grouped by tag

2.1. The menu is split into sections, one per dish tag associated with this
chef, using the order and tags returned by `GET /api/dish/tags?chefId=`
(`priorityIndex` ascending).

2.2. Each section header shows the tag's English name (e.g. "Mains").

2.3. Within a section, dishes are shown in the order returned in `dishes[]`
for that `dishTagDto.id`, filtered to `status: "ACTIVE"` only.

2.4. A dish whose `status` is not `ACTIVE` is never shown on the menu.

### AC-3 — Dish card

3.1. Each dish card shows: image (`url`), name (`nameEn`), price (`price`,
formatted as Armenian dram, e.g. "2,200 ֏"), and portion size (`portionEn`),
when present.

3.2. Clicking a dish card opens the dish detail modal (AC-4) rather than
adding directly to the cart.

### AC-4 — Dish detail modal

4.1. The modal shows the dish's full name, description (`descriptionEn`),
price, portion size, and image.

4.2. The modal includes a quantity selector, starting at `minimumOrderCount`
(default `1` when unset), and an "Add to cart" button showing the line total
for the selected quantity (`price × quantity`).

4.3. The quantity selector cannot go below `minimumOrderCount`.

4.4. Confirming "Add to cart" adds the dish at the selected quantity to the
cart (see `03-cart.md`) and closes the modal.

4.5. The modal can be dismissed without adding to cart (close button, click
outside, or `Esc`), leaving the cart unchanged.

### AC-5 — Add to cart from the card

5.1. Each dish card also exposes a direct "+" control that adds one unit of
the dish (or `minimumOrderCount` units, whichever is greater) to the cart
without opening the modal.

5.2. Adding a dish already in the cart increases its quantity rather than
creating a duplicate line.

### AC-6 — Cross-chef cart guard

6.1. If the cart already contains dishes from a different chef and the
customer tries to add a dish from this chef, the customer is asked to confirm
clearing the existing cart before the new dish is added (a cart can only ever
contain dishes from one chef at a time).
