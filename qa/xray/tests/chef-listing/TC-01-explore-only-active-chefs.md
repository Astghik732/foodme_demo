**Test case:** TC-01 — Explore shows only active chefs
**Folder:** Chef Listing
**Type:** Manual
**Priority:** High
**Labels:** explore, regression

## Preconditions

- The seed dataset is loaded (8 chefs, one with `status: INACTIVE`).
- Storefront is reachable at the environment under test.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Open the storefront and navigate to Explore. | The chef grid loads. |
| 2 | Count the number of chefs shown across all pages. | Exactly the number of `ACTIVE` chefs in the dataset (7). |
| 3 | Search visually (or via API response) for the known `INACTIVE` seeded chef. | That chef does not appear on any page of the grid. |
| 4 | Call `GET /api/chef/active?page=0&size=50` directly and inspect `count`. | `count` equals the number of `ACTIVE` chefs, matching the UI. |
