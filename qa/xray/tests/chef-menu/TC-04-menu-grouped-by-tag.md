**Test case:** TC-04 — Menu is grouped by tag in priority order, active dishes only
**Folder:** Chef Menu
**Type:** Manual
**Priority:** High
**Labels:** chef-page, menu, regression

## Preconditions

- Seed dataset loaded.
- A chef with dishes across at least 3 tags, including at least one
  `INACTIVE` dish.

## Steps

| # | Action | Expected result |
|---|---|---|
| 1 | Call `GET /api/dish/tags?chefId=<id>` for the chef. | Returns tags ordered by `priorityIndex` ascending. |
| 2 | Open the chef's page on the storefront. | Menu sections appear in the same order as step 1. |
| 3 | For each section, compare the dishes shown to `GET /api/chef/{id}`'s `dishes[]` filtered to that tag. | Only `status: ACTIVE` dishes appear; order matches the API response. |
| 4 | Confirm the known `INACTIVE` dish for this chef. | It does not appear in any section of the menu. |
