**Test case:** TC-03 — Chef page header shows correct chef details
**Folder:** Chef Menu
**Type:** Manual
**Priority:** Medium
**Labels:** chef-page, regression

## Preconditions

- Seed dataset loaded.
- A known active chef record (name, cuisine, rating, delivery fee, free
  delivery threshold, delivery methods).

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | From Explore, open a known chef's page. | Page loads without error. |
| 2 | Compare the displayed name and cuisine to the seed data. | Match the English (`en`) values. |
| 3 | Compare the displayed rating. | Matches the seeded value, rounded to one decimal place. |
| 4 | Compare the displayed delivery fee and free-delivery threshold. | Match the seeded `deliveryPrice` and `freeDeliveryFrom` values. |
| 5 | Compare the displayed delivery methods (delivery/takeaway). | Match the seeded `deliveryMethods` for this chef. |
